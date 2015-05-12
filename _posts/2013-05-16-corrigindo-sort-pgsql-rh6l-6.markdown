---
author: Sebastian Webber
comments: true
date: 2013-05-16 22:21:40+00:00
layout: post
slug: corrigindo-sort-pgsql-rh6l-6
title: Corrigindo o problema de ordenação do PostgreSQL no RHEL 6
wordpress_id: 334
categories:
- Linux
- PostgreSQL
tags:
- COLLATE
- LC_ALL
- Order By
- PostgreSQL
- rhel
---

Sobre o ambiente:


> Red Hat Enterprise Linux Server release 6.4 (Santiago)

> PostgreSQL 9.2.4

> LANG=pt_BR.UTF-8

> Banco de dados <code>teste</code>, utilizando o encoding <code>UTF-8</code> e o <code>LC_TYPES</code> e <code>COLLATE</code> como <code>pt_BR.UTF-8</code>


Para exemplificar melhor o problema de ordenação, criei a tabela abaixo:
{% codeblock lang:bash %}
teste=# create table foo (id serial primary key, nome text);
NOTICE:  CREATE TABLE will create implicit sequence "foo_id_seq" for serial column "foo.id"
NOTICE:  CREATE TABLE / PRIMARY KEY will create implicit index "foo_pkey" for table "foo"
CREATE TABLE
teste=# \d foo
                             Tabela "public.foo"
 Coluna |  Tipo   |                      Modificadores                       
--------+---------+----------------------------------------------------------
 id     | integer | não nulo valor padrão de nextval('foo_id_seq'::regclass)
 nome   | text    | 
Índices:
    "foo_pkey" PRIMARY KEY, btree (id)
{% endcodeblock %}

E inseri uns dados de teste:
{% codeblock lang:bash %}
teste=# insert into foo (nome) values ('CRIANSCA'), ('CRIANSCA'), ('CRIANÇA'), ('DANIEL ALDROVANO'), ('DANIELA LAZARUS'), ('DANIELA LEITE');
INSERT 0 6
{% endcodeblock %}

Ao listar os dados, a primeira surpresa:
{% codeblock lang:bash %}
teste=# select * from foo order by nome ;
 id |              nome              
----+--------------------------------
  2 | CRIANCA
  3 | CRIANÇA
  1 | CRIANSCA
  5 | DANIELA LAZARUS
  4 | DANIEL ALDROVANO
  6 | DANIELA LEITE
(6 registros)
{% endcodeblock %}

Notem que o problema em sí está na ordem dada aos IDs 5, 4 e 6. Esse problema é esperado, devido ao fato que (nesse collate especificamente) a operação de ordenação é realizada sem os espaços, assim, <code>DANIELALAZARUS</code> vem antes de <code>DANIELALDROVANO</code> e assim por diante.

Para sanar o problema, pensei em mudar o collate para C por que o mesmo não ignora os espaços na operação de ordenação, porém surgiu um novo problema: os acentos não são ordenados corretamente. 
{% codeblock lang:bash %}
teste=# create collation teste (locale='C');
CREATE COLLATION
teste=# select * from foo order by nome collate teste;
 id |              nome              
----+--------------------------------
  2 | CRIANCA
  1 | CRIANSCA
  3 | CRIANÇA
  4 | DANIEL ALDROVANO
  5 | DANIELA LAZARUS
  6 | DANIELA LEITE
(6 registros)
{% endcodeblock %}

Para sanar o problema, edite o arquivo <code>/usr/share/i18n/locales/pt_BR</code>, e adicione antes de <code>END LC_COLLATE</code>:
{% codeblock lang:bash %}
reorder-after <U00A0>
<U0020><CAP>;<CAP>;<CAP>;<U0020>
reorder-end
{% endcodeblock %}

Aplique as modificações, rodando o comando abaixo:
{% codeblock lang:bash %}
localedef -i pt_BR -c -f UTF-8 -A /usr/share/locale/locale.alias pt_BR
{% endcodeblock %}

Após configurar o locale, reinicie o banco de dados.

Assim os dados são ordenados corretamente:
{% codeblock lang:bash %}
teste=# select * from foo order by nome;
 id |              nome              
----+--------------------------------
  2 | CRIANCA
  3 | CRIANÇA
  1 | CRIANSCA
  4 | DANIEL ALDROVANO
  5 | DANIELA LAZARUS
  6 | DANIELA LEITE
(6 registros)
{% endcodeblock %}


Em especial, um obrigado ao [@fabriziomello](http://fabriziomello.github.io) pela dica.
