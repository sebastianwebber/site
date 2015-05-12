---
author: Sebastian Webber
comments: true
date: 2010-07-14 02:13:35+00:00
layout: post
slug: compilando-o-postgresql-no-rhel-5
title: Compilando o PostgreSQL no RHEL 5
wordpress_id: 24
categories:
- PostgreSQL
- RHEL
- Linux
tags:
- compilar
- PostgreSQL
- rhel
- source
---

Confesso que não é muito diferente do debian, é só instalar as libs necessárias e o ./configure, make e make installl de sempre. Mas talvez isso possa ajudar alguém. Segue:

Instale as bibliotecas necessárias:

{% codeblock lang:bash %}
yum install bison flex zlib zlib-devel readline readline-devel
{% endcodeblock %}

Baixe o postgresql (no exemplo estou usando uma versão antiga e tenho que baixar ela do ftp-archive):

{% codeblock lang:bash %}
wget -c ftp://ftp-archives.postgresql.org/pub/source/v8.2.4/postgresql-8.2.4.tar.bz2
{% endcodeblock %}

Descompacte e instale:

{% codeblock lang:bash %}
tar xvjf postgresql-8.2.4.tar.bz2
cd postgresql-8.2.4
./configure --bindir=/usr/bin
make
make install
{% endcodeblock %}

Agora crie o usuário postgres e inicialize o cluster*:

{% codeblock lang:bash %}
adduser postgres
mkdir /usr/local/pgsql/data
chown -R postgres /usr/local/pgsql
su - postgres
/usr/local/pgsql/bin/initdb -D /usr/local/pgsql/data
logout
{% endcodeblock %}

*OBS: para fins didaticos, criei o cluster no diretório aonde o postgres foi instalado. O ideal é que o diretório do cluster fique em discos e/ou partições separadas. O [blog do telles](http://savepoint.blog.br) tem um [artigo muito interessante a respeito dos discos e partições](http://savepoint.blog.br/postgresql-discos-cia/).

Crie o script de inicialização, inicie o banco e habilite a inicialização automática:

{% codeblock lang:bash %}
cp contrib/start-scripts/linux /etc/init.d/postgresql
chmod +x /etc/init.d/postgresql
service postgresql start
chkconfig postgresql on
{% endcodeblock %}

Um abraço!