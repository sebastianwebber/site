+++
title = "Primeiras impressões do xDB Replication Server"
draft = false
date = "2013-01-08T19:27:58-02:00"
Categories = [ "PostgreSQL", "Oracle" ]
Tags = [ "Replication", "EnterpriseDB", "xDB Replication Server" ]

+++

O [xDB Replication Server](http://www.enterprisedb.com/products-services-training/products-overview/xdb-replication-server-multi-master) é o produto da [EnterpriseDB](http://www.enterprisedb.com) que permite replicação assincrona tanto Single-Master (ou Master/Slave) quanto Multi-Master para banco de dados PostgreSQL/PostgreSQL Plus. O produto tem um funcionamento bem similar a replicação através de [publicação do SQL Server](http://msdn.microsoft.com/en-us/library/ms152567.aspx).

A finalidade desse teste foi replicar tabelas disponibilizadas no Oracle para uma base PostgreSQL.

Para minha surpresa, na atual versão do produto (5.0-2), a replicação Multi-master apenas está disponível para o PostgreSQL/PostgreSQL Plus. Quanto a Single-Master, não há problemas em utilizar Oracle ou SQL Server. Todos os testes realizados foram realizados com o Oracle como master e o PostgreSQL como slave. Acredito que o contrário (PostgreSQL –> Oracle) possa funcionar normalmente.

### Ambiente de testes

#### Banco Master – Oracle

- **Versão:** Oracle 11GR2
- **Sistema Operacional:** Red Hat Enterprise Linux Server release 5.6 (Tikanga)
- **Plataforma:** x86_64

#### Banco Slave – PostgreSQL

- **Versão:** PostgreSQL 8.4.13
- **Sistema Operacional:** CentOS release 6.3 (Final)
- **Plataforma:** x86_64
- **Produto:** xDB Replication Server 5.0-2

> ### Observações
>
> Propositalmente o Oracle está sendo executado em outro local e, necessariamente, em outra cidade. Para facilitar o ambiente, tanto o servidor Publicação quanto Subscrição estão rodando no mesmo servidor que está rodando o PostgreSQL e, especificamente, configurados no banco de dados ‘postgres’.


### Na prática
Após liberar acesso aos servidores através de VPN e criar usuários e definir permissões de acesso ao usuário ‘hr’ no Oracle, criamos a tabela ‘tabela_teste’ com as colunas descritas abaixo:

Nome | Tipo
---- | -----
id | NUMBER(30,0)
nome | VARCHAR2(2048)

------

Ao mandar realizar um snapshot dados, ocorreu o erro abaixo:

> Disabling FK constraints & triggers on hr.tabela_teste before truncate… Error Loading Data into Table: TABELA_TESTE: ERROR: relation “hr.tabela_teste” does not exist at position 67

Assim notei o primeiro problema: **é necessário ter a mesma estrutura das tabelas publicadas no servidor destino** (mesmo schema inclusive) para que a replicação funcione.

Após criar a tabela no PostgreSQL, fizemos um novo teste: Adicionar uma coluna do tipo CLOB. Após criar a mesma coluna em nossa tabela no PostgreSQL. A replicação deixou de funcionar, com isso foi identificado incompatibilidade com os tipos de dados binários.

Nosso teste final cobria o uso de campos data/hora. Assim, foi adicionado uma nova coluna na tabela e a mesma foi replicada seguindo a ordem das colunas e isso resultou o seguinte problema:

```bash
hr=# select * from hr.tabela_teste order by id;
 id | nome |                 pdf                  | data
----+------+--------------------------------------+------
  1 |      | 2012-01-08 00:00:00.000000 -02:00:00 |
  2 |      | 2012-01-08 00:00:00.000000 -02:00:00 |
  3 |      | 2012-01-08 00:00:00.000000 -02:00:00 |
  4 |      | 2012-01-08 00:00:00.000000 -02:00:00 |
  5 |      | 2012-01-08 00:00:00.000000 -02:00:00 |
  6 |      | 2013-01-08 10:44:51.000000 -02:00:00 |
  7 |      | 2013-01-08 10:44:51.000000 -02:00:00 |
  8 |      | 2013-01-08 10:54:36.000000 -02:00:00 |
  9 |      | 2013-01-08 10:54:36.000000 -02:00:00 |
 10 |      | 2013-01-08 10:54:36.000000 -02:00:00 |
(10 rows)

hr=# \d hr.tabela_teste
             Table "hr.tabela_teste"
 Column |            Type             | Modifiers
--------+-----------------------------+-----------
 id     | integer                     | not null
 nome   | text                        |
 pdf    | bytea                       |
 data   | timestamp without time zone |
Indexes:
    "tabela_teste_pk" PRIMARY KEY, btree (id)
```
------


O problema foi normalizado apenas quando a coluna pdf foi excluida.

Por fim, foi realizada uma carga de dados nessa tabela para levantarmos o tempo de resposta ([detalhes da carga aqui](http://helkmut.blogspot.com.br/2013/01/oracle-populando-tabelas-com-clob-e.html)). Enquanto tentamos popular a tabela ocorreu mais uma surpresa:

```bash
ORA-01438: valor maior que a precisão especificada usado para esta coluna
ORA-06512: em “HR.RRPI_HR_TABELA_TESTE”, line 2
```
-----

Pelo que identificamos o problema ocorre nas tabelas de controle da replicação que são criadas baseadas na estrutura da tabela original. Como antes da carga aumentamos o tamanho do campo para poder inserir mais registros as tabelas de controle não foram alteradas acabou causando esse erro.

### Conclusões
#### O que ele faz

O xDB Replication Server permite fazer replicação de pacotes de dados entre multiplos servidores, sejam eles PostgreSQL/PostgreSQL Plus, Oracle ou SQL Server de forma assincrona. Atualmente apenas o PostgreSQL/PostgreSQL Plus tem disponível o modelo Multi-Master.

#### O que ele não faz

Com o produto não é possível criar qualquer solução de alta disponibilidade. Basicamente o produto mantém uma cópia das tabelas da base origem, na base destino.

#### Pontos positivos

Pelo fato de o mesmo replicar os dados em suas tabelas de controle, caso o servidor de subscrições esteja indisponível, os dados serão analisados quando ele se tornar disponível e assim executar todas as tarefas necessárias para manter os dados iguais em ambos os lados. É possível, também, efetuar filtros dos dados a serem copiados e assim diminir o tempo de carga de um servidor para outro. Por fim, é possível agendar para que replica dos dados seja atualizada de tempos em tempos pela própria interface do xDB Replication Console, sem depender de componentes do SO ou ferramentas de terceiros.

#### Pontos negativos

A primeira limitação que incomodou é que, pelo menos através do xDB Replication Console, não foi possível criar a estrutura de tabelas automaticamente. É possível que, em ambientes que a publicação contenha muitas tabelas, ocorram muitos problemas devido a divergencia das tabelas ou colunas entre os servidores. A replicação dos dados é feita através de triggers nas tabelas que fazem parte da publicação e as alterações ficam gravadas em tabelas de controle. Além do fato gravação dos dados nessas tabelas concorrer com as outras transações, em nossos testes, essas tabelas de controle não eram alteradas quando realizadas mudanças nas tabelas alvo e assim impedindo a replicação de funcionar. Na interface de administração, não encontrei opção para atualizar-las e a única solução que encontrei foi recriar a publicação. Há algumas restrições quanto aos tipos de dados, em especial os binários. Não há opção para selecionar quais colunas serão replicadas (nem como uma consulta ao invés de um objeto) e também não conseguimos mapear views, sejam materializadas ou não.

Em especial, obrigado ao [Gabriel](http://helkmut.blogspot.com.br), pela ajuda com a integração com o Oracle.