---
title: "Instalando o PL/Debugger no PostgreSQL 9.3 no EL6"
date: 2014-06-18 11:41:06 -0300
comments: true
categories: 
 - PostgreSQL
---

> **NOTA:** Baseado na dica do @FabrizioMello, ajustei este post e ainda deixei o processo ainda mais simples.

Com o banco já instalado via RPM, é necessário instalar algumas bibliotecas para compilar a extensão, assim instale os RPMs necessários:

```bash
yum install make gcc zlib-devel readline-devel postgresql93-devel openssl-devel git
```

Agora, faça um clone do módulo pldebbuger:

```bash
git clone http://git.postgresql.org/git/pldebugger.git
```

Para compilar o módulo, ajustar o PATH também a variável USE_PGXS:

```bash
export PATH=${PATH}:/usr/pgsql-9.3/bin
export USE_PGXS=1
```

Agora, compile e instale o módulo:

```bash
cd pldebugger
make
make install
```

Configure o PostgreSQL para utilizar o módulo compilado, ajustando o arquivo `/var/lib/pgsql-9.3/data/postgresql.conf`, descomentando a variavel `shared_preload_libraries` e configurando-a conforme abaixo:

```bash
shared_preload_libraries = '/usr/pgsql-9.3/lib/plugin_debugger.so'
```

Reinicie o banco de dados:

```bash
service postgresql-9.3 restart
```

Para finalizar, crie a extensão no banco necessário para fazer o debug:
```sql
CREATE EXTENSION pldbgapi;
```