---
layout: post
title: "Trabalhando com o londiste"
date: 2014-04-25 14:33:00 -0300
comments: true
categories: 
 - Londiste
---

Este post é um complemento para o post que cita a instalação e configuração do Londiste. Vou atualizar este post conforme possível.

> É importante lembrar que a citação <code>[CON_STR]</code> quer dizer a string de conexão utilizada, seguindo o padrão utilizado pela libpq.

> Para simplificar a configuração, ao citar o arquivo de configuração, vou sempre utilizar o arquivo <code>/etc/londiste/config.ini</code>, mas lembre é necessário criar um arquivo separado para cada job.

## String de conexão

A string de conexão é detalhada na documentação oficial, conforme abaixo:

 - <b>Sintaxe:</b> http://www.postgresql.org/docs/9.2/static/libpq-connect.html#LIBPQ-CONNSTRING
 - <b>Opções:</b> http://www.postgresql.org/docs/9.2/static/libpq-connect.html#LIBPQ-PARAMKEYWORDS

Exemplo:
{% codeblock lang:bash %}
host=localhost port=5432 dbname=mydb connect_timeout=10
{% endcodeblock %}

## Manutenção dos nós

### Adicionando e removendo nós

Para adicionar o nó tipo <code>root</code> (master da replicação):
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini create-root nome_node "[CON_STR]"
{% endcodeblock %}

Para adicionar nós tipo <code>branch</code> ou <code>leaf</code>:
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini create-XXXXX nome_node "[CON_STR_DESTINO]" --provider="[CON_STR_ROOT]"
{% endcodeblock %}

> Aonde <code>XXXXX</code> é o tipo de nó (branch ou leaf)

> <code>[CON_STR_DESTINO]</code> é a string de conexão do servidor que será o nó (slave)

> <code>[CON_STR_ROOT]</code> é a string de conexão do servidor que será o root (master)

Para remover o nó:
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini drop-node nome_node
{% endcodeblock %}

### Iniciando e parando o daemon

Para iniciar:
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini -d worker
{% endcodeblock %}

Para parar:
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini --stop
{% endcodeblock %}
> Para forçar a parada do mesmo, substitua o <code>\-\-stop</code> por <code>\-\-kill</code>

## Trabalhando com tabelas

Cada operação é específica para cada nó.

### Adicionando e removendo tabelas

> a opção <code>\-\-all</code> pode ser utilizada para aplicar a operação em todos os objetos

Para adicionar:
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini add-table nome_tabela
{% endcodeblock %}

Para remover:
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini remove-table nome_tabela
{% endcodeblock %}

### Listando objetos replicadas
Para listar as tabelas:
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini tables
{% endcodeblock %}

Para listar as sequências:
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini seqs
{% endcodeblock %}

### Listando objetos disponíveis para replicação

O comando a baixo necessáriamente precisa ser executado em um nó slave (leaf ou branch).

{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini missing
{% endcodeblock %}


## Listando status da replicação
{% codeblock lang:bash %}
londiste3 /etc/londiste/config.ini status
{% endcodeblock %}

