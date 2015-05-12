---
author: Sebastian Webber
comments: true
date: 2012-11-26 03:34:28+00:00
layout: post
slug: calcular-o-tamanho-da-database-no-oracle-10g11g
title: Calcular o tamanho da database no oracle 10g/11g
wordpress_id: 262
categories:
- Oracle
tags:
- Oracle
- Rapidinhas
---

Encontrei essa dica em outro site e resolvi compartilhar.

{% codeblock lang:sql %}
SET SERVEROUTPUT ON
Declare

  ddf Number:= 0;
  dtf Number:= 0;
  log_bytes Number:= 0;
  total Number:= 0;

BEGIN
  select sum(bytes)/power(1024,3) into ddf from dba_data_files;
  select sum(bytes)/power(1024,3) into dtf from dba_temp_files;
  select sum(bytes)/power(1024,3) into log_bytes from v$log;

  total:= round(ddf+dtf+log_bytes, 3);
  dbms_output.put_line('TOTAL DB Size is: '||total||'GB ');
END;
/
{% endcodeblock %}

Fonte: [http://techxploration.blogspot.com.au/2012/06/script-to-get-oracle-database-size.html](http://techxploration.blogspot.com.au/2012/06/script-to-get-oracle-database-size.html)
