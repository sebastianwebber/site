+++
title = "Corrigindo o problema de ordenação do PostgreSQL no RHEL 6"
draft = false
date = "2013-05-16T19:46:53-02:00"
Categories = [ "PostgreSQL" ]
Tags = [ "Tips", "Encoding", "Locale",  "Charset", "Sorting" ]

+++

Sobre o ambiente:

> Red Hat Enterprise Linux Server release 6.4 (Santiago)
>
> PostgreSQL 9.2.4
>
> LANG=pt_BR.UTF-8
>
> Banco de dados `teste`, utilizando o encoding `UTF-8` e o `LC_TYPES` e `COLLATE` como `pt_BR.UTF-8``


Para exemplificar melhor o problema de ordenação, criei a tabela abaixo:

```bash
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
```

E inseri uns dados de teste:

```bash
teste=# insert into foo (nome) values ('CRIANSCA'), ('CRIANSCA'), ('CRIANÇA'), ('DANIEL ALDROVANO'), ('DANIELA LAZARUS'), ('DANIELA LEITE');
INSERT 0 6
```

Ao listar os dados, a primeira surpresa:

```bash
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
```

Notem que o problema em sí está na ordem dada aos IDs 5, 4 e 6. Esse problema é esperado, devido ao fato que (nesse collate especificamente) a operação de ordenação é realizada sem os espaços, assim, `DANIELALAZARUS` vem antes de `DANIELALDROVANO` e assim por diante.

Para sanar o problema, pensei em mudar o collate para C por que o mesmo não ignora os espaços na operação de ordenação, porém surgiu um novo problema: os acentos não são ordenados corretamente.

```bash
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
```

Para sanar o problema, edite o arquivo `/usr/share/i18n/locales/pt_BR`, e adicione antes de `END LC_COLLATE`:

```bash
reorder-after <U00A0>
<U0020><CAP>;<CAP>;<CAP>;<U0020>
reorder-end
```

Aplique as modificações, rodando o comando abaixo:

```
localedef -i pt_BR -c -f UTF-8 -A /usr/share/locale/locale.alias pt_BR
```

Após configurar o locale, reinicie o banco de dados.

Assim os dados são ordenados corretamente:

```bash
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
```

Em especial, um obrigado ao [@fabriziomello](http://fabriziomello.github.io/) pela dica.
