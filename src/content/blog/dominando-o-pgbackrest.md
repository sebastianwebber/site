---
title: "Dominando o PGBackRest "
draft: true
date: "2017-02-11T11:21:20-02:00"
categories: 
- PostgreSQL
- PGBackRest
tags:
- backup
- restore
- database
- good practices

---

# Sobre o PGBackRest

O [PGBackRest](http://pgbackrest.org) é uma ferramenta de backup do banco de dados PostgreSQL feito pela [Crunchy Data](http://www.crunchydata.com/). Ele basicamente é uma coleção de funções e scripts em [perl](https://en.wikipedia.org/wiki/Perl) que possui as seguintes opções/características:

 - Backup e **restore** em paralelo
 - Suporte a **operações remotas** (o que permite centralizar tudo em algum servidor)
 - Suporte backup **Full**, **incremental** e **diferencial**
 - Suporte a **rotatividade e expiração de WALs** arquivados
 - **Arquivamento** de WALs **em paralelo**
 - Suporte a **tablespaces**
 - Compatibilidade com **versões >= a 8.3**

 > **NOTA:** Admita que você não esperava que versões antigas fossem suportadas! hahaha

Caso você se preocupe, ele utiliza a [licença MIT](https://github.com/pgbackrest/pgbackrest/blob/master/LICENSE).

## Conceitos básicos

O PGBackRest utiliza alguns conceitos pra funcionar. Eles são, basicamente, `stanza` e `repostory`.

`Repository` é diretório que vai ser armazenado os backups de todos os bancos de dados. Eu recomendo que você utilize um `Repository` pra cada ambiente. 

`Stanza` é o cluster PostgreSQL. Um `Repository` pode ter uma ou mais `Stanzas`.

`Cluster` é como é chamado o diretório que contém os dados do PostgreSQL, aquele gerado pelo `initdb`.

### Tipos de backup

O PGBackRest suporta 3 tipos de backup `full`, `incremental` e `differential`.

Backup `Full` é uma cópia completa do cluster para o servidor de backup.

Backup `Differential` é uma cópia apenas os da diferença dos arquivos desde o ultimo backup `Full`. A vantagem dele é que é necessário menos espaço do que um backup `full`, entretando, ambos o backup `full` e o `differential` precisam estar integros para restaurarmos o backup. **Essa é a opção padrão** e obviamente rodará um backup `full` caso o mesmo não exista.

Backup `incremental` copia apenas os arquivos que mudaram desde o último backup (o que pode ser outro backup `incremental`, `differential` ou mesmo `full`).

### Políticas de retenção

Apesar de ser o sonho de todos ter todos os backups por um longo período de tempo e, como isso come muito espaço em disco, precisamos apagar esses backups de tempos em tempos. Pra resolver isso tempos 2 parâmetros pra resolver essa questão: `retention-full` e `retention-diff`. 

O parâmetro `retention-full` configura quantos backup `full` serão mantidos e com base nele automaticamente todos os arquivos dos backups e WALs retidos são apagados. Como sugestão sugiro que você mantenha no mínimo 2 cópias do backup full.

O parâmetro `retention-diff` configura quantos backups `differential` serão mantidos. Aqui o numero ideal vai depender da sua estratégia, mas eu posso te sugerir manter no mínimo 2 deles, assim rola fazer algo parecido com o abaixo:


> * Backup `Full` no domingo
> * Backup `incremental` na segunda-feira
> * Backup `differential` na terça-feira
> * Backup `incremental` na quarta-feira
> * Backup `incremental` na quinta-feira
> * Backup `differential` na sexta-feira
> * Backup `incremental` no sábado


# Instalação no CEntOS 7

O pacotes de instalação do PGBackRest estão disponíveis no [repositório do PGDG](yum.postgresql.org), através do pacote `pgbackrest`, sendo assim, instale o repostório e digite:

```bash
yum install pgbackrest
```

> **Importante:** Nada impede você ir lá nos [fontes do github](https://github.com/pgbackrest/pgbackrest) e fazer download do script manualmente mas Eu recomendo que você utilize os pacotes distribuidos pelo PGDG. É limpo, bonito, ambos os **Sys Admin** (RAIZ|**Nutella**) aprovam e foi feito por alguém que sabe o que está fazendo. 
