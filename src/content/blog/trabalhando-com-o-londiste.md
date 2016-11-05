---
title: "Trabalhando com o londiste"
date: 2014-04-25 14:33:00 -0300
comments: true
categories: 
 - Londiste
 - PostgreSQL
---

Este post é um complemento para o post que cita a instalação e configuração do Londiste. Vou atualizar este post conforme possível.

> É importante lembrar que a citação `[CON_STR]` quer dizer a string de conexão utilizada, seguindo o padrão utilizado pela libpq.

> Para simplificar a configuração, ao citar o arquivo de configuração, vou sempre utilizar o arquivo `/etc/londiste/config.ini`, mas lembre é necessário criar um arquivo separado para cada job.

## String de conexão

A string de conexão é detalhada na documentação oficial, conforme abaixo:

 - **Sintaxe:** http://www.postgresql.org/docs/9.2/static/libpq-connect.html#LIBPQ-CONNSTRING
 - **Opções:** http://www.postgresql.org/docs/9.2/static/libpq-connect.html#LIBPQ-PARAMKEYWORDS

Exemplo:
```bash
host=localhost port=5432 dbname=mydb connect_timeout=10
```

## Manutenção dos nós

### Adicionando e removendo nós

Para adicionar o nó tipo `root` (master da replicação):
```bash
londiste3 /etc/londiste/config.ini create-root nome_node "[CON_STR]"
```

Para adicionar nós tipo `branch` ou `leaf`:
```bash
londiste3 /etc/londiste/config.ini create-XXXXX nome_node "[CON_STR_DESTINO]" --provider="[CON_STR_ROOT]"
```

> Aonde `XXXXX` é o tipo de nó (branch ou leaf)

> `[CON_STR_DESTINO]` é a string de conexão do servidor que será o nó (slave)

> `[CON_STR_ROOT]` é a string de conexão do servidor que será o root (master)

Para remover o nó:
```bash
londiste3 /etc/londiste/config.ini drop-node nome_node
```

### Iniciando e parando o daemon

Para iniciar:
```bash
londiste3 /etc/londiste/config.ini -d worker
```

Para parar:
```bash
londiste3 /etc/londiste/config.ini --stop
```
> Para forçar a parada do mesmo, substitua o `\-\-stop` por `\-\-kill`

## Trabalhando com tabelas

Cada operação é específica para cada nó.

### Adicionando e removendo tabelas

> a opção `\-\-all` pode ser utilizada para aplicar a operação em todos os objetos

Para adicionar:
```bash
londiste3 /etc/londiste/config.ini add-table nome_tabela
```

Para remover:
```bash
londiste3 /etc/londiste/config.ini remove-table nome_tabela
```

### Listando objetos replicadas
Para listar as tabelas:
```bash
londiste3 /etc/londiste/config.ini tables
```

Para listar as sequências:
```bash
londiste3 /etc/londiste/config.ini seqs
```

### Listando objetos disponíveis para replicação

O comando a baixo necessáriamente precisa ser executado em um nó slave (leaf ou branch).

```bash
londiste3 /etc/londiste/config.ini missing
```


## Listando status da replicação
```bash
londiste3 /etc/londiste/config.ini status
```

