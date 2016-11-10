---
draft: false
title: "O Autovacuum do PostgreSQL não é o inimigo!"
date: "2016-11-07T00:10:41-02:00"

Categories:
 - PostgreSQL
 - Translations

Tags:
 - PostgreSQL
 - Vacuum
 - Autovacuum
 - CitusData
 - Bloat

---

> **ATENÇÃO!** Este post é uma tradução para Português do Brasil do [blog da citusdata](https://www.citusdata.com), escrito pelo Sr. Joe Nelson. O post original pode ser encontrado na URL abaixo:
>
> - [https://www.citusdata.com/blog/2016/11/04/autovacuum-not-the-enemy/](https://www.citusdata.com/blog/2016/11/04/autovacuum-not-the-enemy/)
>
> Fique a vontade para comentar quaisquer problemas na tradução.

É um equívoco comum que workloads com grandes volumes de leituras e escritas no PostgreSQL inevitavelmente causam ineficiencia no banco de dados. Nós ouvimos casos aonde os usuários encontram lentidões fazendo apenas algumas centenas de gravações por segundo e recorrem a sistemas como Dynamo ou Cassandra por frustração. No entanto, o PostgreSQL pode lidar com essas cargas de trabalho sem um problema, desde que esteja configurado corretamente.

O problema deriva do que é conhecido como "inchaço", um fenômeno do PostgreSQL e de outros bancos de dados MVCC que causa o aumento do espaço em disco e uma baixa no desempenho. Vamos ver como o autovacuum, uma ferramenta que combate o inchaço, é tipicamente incompreendida e mal configurada. Ao falar num baixo nível sobre os componentes internos do PostgreSQL vamos chegar numa melhor configuração para o autovacuum. Finalmente vamos considerar como distribuir os dados sob um cluster PostgreSQL como o Citus também pode combater o inchaço. 


## Problemas no paraíso do MVCC

Aqui o problema começa: Arquitetos de bancos de dados desejam permitir transações read-only num banco de dados para retornar os dados sem bloquear as atualizações concorrentes. Fazendo isso, se reduz a latência das requisições em ambientes com leitura pesada, comum em aplicações web.

Entretanto, para permitir que leituras contínuas prossigam sem pausa, é necessário manter um snapshot diferente do mundo para algumas requisições e finalmente conciliar as diferenças. Essas "pequenas mentiras" ficam sujeitas a uma penalidade de espaço, familiar a todas as mentiras - você vai precisar de uma boa memória para manter o histórico em ordem. 

O PostgreSQL e outros bancos de dados relacionais usam uma técnica chamada Multi-Version Concurrency Control (MVCC) para manter o controle de cada transação e a penalidade de espaço do MVCC é chamada de inchaço. O PostgreSQL é uma máquina de inchaço e ele vai inchar sem escrúpulos. O PostgreSQL precisa de ajuda de uma ferramenta externa chamada `VACUUM` para ter uma chance de limpar essa "sujeira".

Por razões que vamos ver mais tarde, tabelas e índices inchados não somente disperdiçam espaço mas também deixam as consultas mais lentas. Então isso não é só uma questão de conseguir um disco rigido maior e esquecer sobre o inchaço. Onde há atualizações nos dados há inchaço e é com você executar o `VACUUM`.

Não é tão ruim quanto costumava ser. Num passado distante (antes do PostgreSQL 8), os DBAs tinham que executar o `VACUUM` manualmente. Eles tinham que balancear o consumo de recursos contra a carga (load average) do banco de dados existente para decidir quando executa-lo e potencialmente quando interrompe-lo. Hoje em dia podemos configurar o daemon do `AutoVACUUM` para executar essas limpezas nos momentos mais oportunos.

O `AutoVACUUM` funciona bem quando configurado corretamente. Entretando, suas configurações padrão são apropriadas para bancos de dados com algumas centenas de mega bytes de tamanho e não é agressivo o bastante para grandes bancos de dados. Em ambientes de produção ele começa a ficar pra trás.

Quando o `VACUUM` ficar pra trás ele vai consumir mais recursos quando ele é executado e isso vai interferir na operação normal das consultas. Isso pode levar à um circulo vicioso aonde os administradores de bancos de dados reconfiguram erroniamente o " devorador de recursos `AutoVACUUM`" pra rodar com menos frequência ou não rodar mais. O `AutoVACUUM` não é o ínimigo e **desabilitá-lo é desastroso**. 

## A magreza no inchaço

O PostgreSQL numera cada nova transação com um identificador incremental (`txid`). Todas as linhas na tabela também possuem colunas escondidas (`xmin`, `xmax`) gravando o `transaction id` mínimo e máximo que são permitidos ver o registro. Você pode imaginar o comando `SELECT` incluindo implicitamente `WHERE xmin <= txid_current() AND (xmax = 0 OR txid_current() < xmax)`. Registros que não possuem nenhuma transação ativa ou no futuro podem ser consideradas "mortos". Isso significa que não há transações ativas com `xmin ≤ txid < xmax`.

Novos registros ou registros atualizados utilizam o `txid` da transação que o criou para o seu `xmin` e registros apagados definem o `xmax` com o `txid` que o deletou.

Ilustração rápida:

```sql
begin;

select txid_current(); -- supostamente vai retornar 1
create table foo (bar integer);
insert into foo (bar) values (100);

select xmin, xmax from foo;

commit;
```

Vai retornar:

```sql
┌──────┬──────┐
│ xmin │ xmax │
├──────┼──────┤
│    1 │    0 │
└──────┴──────┘
```

Se atualizarmos o registro, o `xmin` vai avançar:

```sql
begin;

update foo set bar = 200;
select xmin, xmax from foo;

commit;
```

Isso retorna:

```sql
┌──────┬──────┐
│ xmin │ xmax │
├──────┼──────┤
│    2 │    0 │
└──────┴──────┘
```

O que não é exibido é que agora há um registro morto na tabela. Atualizando o registro efetivamente apaga-o e insere-0 com os valores alterados. O registro que estamos vendo foi recentemente inserido (pelo  `txid` 2) e o registro original está no disco com `xmix=1, xmax=2`. Podemos confirmar perguntando por informações sobre as tuplas (registros) nessa tabela.

```sql
create extension pgstattuple;

select tuple_count, dead_tuple_count from pgstattuple('public.foo');
```

```sql
┌─────────────┬──────────────────┐
│ tuple_count │ dead_tuple_count │
├─────────────┼──────────────────┤
│           1 │                1 │
└─────────────┴──────────────────┘
```

O PostgreSQL também provê uma API de baixo nível para ver informações sobre o armazenmaneto físico das páginas de bancos de dados (pedaços da tabela armazenados no disco). Essa API nos permite ver o `xmin` e `xmax` de todas as linhas e, apesar de algumas considerações de segurança, os valores dos registros apagados não sÃo visíveis.

```sql
create extension pageinspect;

select t_xmin, t_xmax from heap_page_items(get_raw_page('foo', 0));
```

```sql
┌────────┬────────┐
│ t_xmin │ t_xmax │
├────────┼────────┤
│      1 │      2 │
│      2 │      0 │
└────────┴────────┘
```

Nesse ponto você pode ver um jeito de gerar o inchaço: é só continuamente atualizar muitos registros de uma tabela. Se o `AutoVACUUM` foi desabilitado, o tamanho da tabela vai continuar a aumentar mesmo que o número de registros visiveis continue o mesmo. Um outro jeito de causar o inchaço é inserir uma grande quantidade de registros dentro de uma transação mas executar o `ROLLBACK` ao invés do `COMMIT`.

Se o `AutoVACUUM` está rodando, ele pode limpar esses registros mortos _a menos que..._ os registros apagados são impedidos de morrer! Nesse cenário de filmes de terror uma transação está rodando por muito tempo (como uma consulta analítica) e seus `txid` previnem registros como de serem marcados como mortos, mesmo quando apagados por outro comando. A consulta que está rodando a muito tempo nem precisa consultar os registros apagados, a presença dos registros quando a consulta iniciou garante que elas não podem ser removidas. Combinar OLTP e consultas analíticas que rodam por muito tempo é um cocktail perigoso.

Fora o intratável apocalipse zumbi acíma, o `AutoVACUUM` pode deixar as coisas sob controler com a configuração adequada. Vamos ver algumas consenquências do inchaço antes de considerar o `AutoVACUUM`.

## O inchaço e a velocidade das consultas

Além de simplismente ser um disperdício de espaço, o inchaço prejudica a velocidade da consulta. Cada tabela e seu índice é armazenado num array de páginas de tamanho fixo (normalmente de `8KB`). Quando a consulta solicita os registros, o banco de dados carrega essas páginas na memória. Quanto mais registros mortos por página, mais `I/O` é disperdiçado na carga dos dados para a memória. Por exemplo: uma leitura sequencial precisa carregar e passar por todos registros mortos. 

Inchaço também torna menos provavel que os registros ativos para consulta vão caber na memória todos de uma vez. Inchaços fazem registros vivos mais dispersos por página física,