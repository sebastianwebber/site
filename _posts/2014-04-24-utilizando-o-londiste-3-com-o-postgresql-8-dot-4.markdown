---
layout: post
title: "Utilizando o Londiste 3 com o PostgreSQL 8.4"
date: 2014-04-24 18:34:52 -0300
comments: true
published: false
categories: 
 - Londiste
 - PostgreSQL
---

Devido ao pacote do skytools não estar disponível no repositório oficial do pgdg, é necessário compilar o mesmo.

Instale os pacotes necessários:

{% codeblock lang:bash %}
yum install gcc make libtool git python-devel python-psycopg2 asciidoc xmlto cpp
{% endcodeblock %}

Baixe o skytools do git e instale-o:
{% codeblock lang:bash %}
mkdir /opt/resources
git clone https://github.com/markokr/skytools.git /opt/resources/skytools
cd /opt/resources/skytools/
git submodule init
git submodule update
./autogen.sh
./configure --prefix=/usr/local/skytools
make
make install
{% endcodeblock %}

Referências:

 - https://github.com/markokr/skytools/blob/master/INSTALL