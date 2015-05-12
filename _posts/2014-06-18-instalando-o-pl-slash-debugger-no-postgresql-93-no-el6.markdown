---
layout: post
title: "Instalando o PL/Debugger no PostgreSQL 9.3 no EL6"
date: 2014-06-18 11:41:06 -0300
comments: true
categories: 
 - PostgreSQL
---

> **NOTA:** Baseado na dica do @FabrizioMello, ajustei este post e ainda deixei o processo ainda mais simples.

Com o banco já instalado via RPM, é necessário instalar algumas bibliotecas para compilar a extensão, assim instale os RPMs necessários:
{% codeblock lang:bash %}
yum install make gcc zlib-devel readline-devel postgresql93-devel openssl-devel git
{% endcodeblock %}

Agora, faça um clone do módulo pldebbuger:
{% codeblock lang:bash %}
git clone http://git.postgresql.org/git/pldebugger.git
{% endcodeblock %}

Para compilar o módulo, ajustar o PATH também a variável USE_PGXS:
{% codeblock lang:bash %}
export PATH=${PATH}:/usr/pgsql-9.3/bin
export USE_PGXS=1
{% endcodeblock %}

Agora, compile e instale o módulo:
{% codeblock lang:bash %}
cd pldebugger
make
make install
{% endcodeblock %}

Configure o PostgreSQL para utilizar o módulo compilado, ajustando o arquivo <code>/var/lib/pgsql-9.3/data/postgresql.conf</code>, descomentando a variavel <code>shared_preload_libraries</code> e configurando-a conforme abaixo:
{% codeblock lang:bash %}
shared_preload_libraries = '/usr/pgsql-9.3/lib/plugin_debugger.so'
{% endcodeblock %}

Reinicie o banco de dados:
{% codeblock lang:bash %}
service postgresql-9.3 restart
{% endcodeblock %}

Para finalizar, crie a extensão no banco necessário para fazer o debug:
{% codeblock lang:sql %}
CREATE EXTENSION pldbgapi;
{% endcodeblock %}