---
author: Sebastian Webber
comments: true
date: 2012-05-06 16:34:38+00:00
layout: post
slug: ora-00439-feature-not-enabled-deferred-segment-creation
title: 'ORA-00439: feature not enabled: Deferred Segment Creation'
wordpress_id: 226
categories:
- Oracle
tags:
- Backup
- Data Pump
- EXPDP
- IMPDP
- Linux
- Oracle
---

Durante a migração de um banco, me deparei com a seguinte saida do impdp:

{% codeblock lang:bash %}
CREATE TABLE "MYUSER"."MYTABLE" ("COL1" NUMBER(11,0) NOT NULL ENABLE, "COL2" NUMBER(11,0) NOT NULL ENABLE...) SEGMENT CREATION DEFERRED ..
ORA-39083: Tipo de objeto TABLE:"MYUSER"."MYTABLE" falhou ao ser criado com o erro:
ORA-00439: recurso não ativado: Deferred Segment Creation
{% endcodeblock %}

Após isso, fui confirmar o valor do parametro:
{% codeblock lang:sql %}
SQL> column type format a7
SQL> show parameter deferred_segment_creation

NAME                                 TYPE    VALUE
------------------------------------ ------- ------------------------------
deferred_segment_creation            boolean TRUE
{% endcodeblock %}

Ao confirmar que o parametro estava habilitado tive que alterar a compatibilidade do dump, adicionando o parametro 'version=10.2' na chamada do expdp e do impdp. Como no exemplo:

Para exportar:
{% codeblock lang:bash %}
EXPDP usuario/senha dumpfile=arquivo_dump.dmp directory=DATA_DUMP_DIR version=10.2
{% endcodeblock %}

No outro server, para importar o dump criado
{% codeblock lang:bash %}
IMPDP usuario/senha dumpfile=arquivo_dump.dmp directory=DATA_DUMP_DIR version=10.2
{% endcodeblock %}

Referência: [http://oraclequirks.blogspot.com.br/2011/02/ora-00439-feature-not-enabled-deferred.html](http://oraclequirks.blogspot.com.br/2011/02/ora-00439-feature-not-enabled-deferred.html)
