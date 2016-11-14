---
draft: false
title: "O Autovacuum do PostgreSQL não é o inimigo!"
date: "2016-11-14T14:10:41-02:00"

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

É um equívoco comum que workloads com grandes volumes de leituras e escritas no PostgreSQL inevitavelmente causam ineficiencia no banco de dados. Nós ouvimos casos aonde os usuários encontram lentidões fazendo apenas algumas centenas de gravações por segundo e recorrem a sistemas como Dynamo ou Cassandra por frustração. No entanto, o PostgreSQL pode lidar com essas cargas de trabalho sem nenhum problema, desde que ele esteja configurado corretamente.

O problema deriva do que é conhecido como "inchaço", um fenômeno do PostgreSQL e de outros bancos de dados MVCC que causa o aumento do espaço em disco e uma baixa no desempenho. Vamos ver como o AutoVACUUM, uma ferramenta que combate o inchaço, é tipicamente incompreendida e mal configurada. Ao falar num baixo nível sobre os componentes internos do PostgreSQL vamos chegar numa melhor configuração para o AutoVACUUM. Finalmente vamos considerar como distribuir os dados sob um cluster PostgreSQL como o Citus também pode combater o inchaço. 


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

Além de simplismente ser um disperdício de espaço, o inchaço prejudica a velocidade da consulta. Cada tabela e seu índice é armazenado num array de páginas de tamanho fixo (normalmente de `8KB`). Quando a consulta solicita os registros, o banco de dados carrega essas páginas na memória. Quanto mais registros mortos por página, mais `I/O` é disperdiçado na carga dos dados para a memória. Por exemplo: **uma leitura sequencial precisa carregar e passar por todos registros mortos**. 

O inchaço também torna menos provavel que os registros ativos para consulta vão caber na memória todos de uma vez. Inchaços fazem registros vivos mais dispersos por página física e, consenquêntemente, mais páginas são necessárias em memória para o mesmo número de registros "vivos". Isso causa swap e torna alguns algoritmos e planos de consulta inaceitaveis para execução.

Um caso de inchaço desagradavel é o [próprio catálogo](https://www.postgresql.org/docs/current/static/catalogs.html) do PostgreSQL. **O catalogo pode inchar por que eles também são tabelas.** Um jeito de causar isso acontecer é através das tabelas temporárias, constantemente criando e apagando. Isso causa constantes atualizações nas tabelas do catálogo. Quando o catálogo está inchado, as funções administrativas ficam lentas e até coisas como rodar um `\d` no psql é lento.

Índices ficam inchados também. Um índice é um mapeamento de chaves de valores de dados para identificadores de registros. Esses identificadores nomeiam a página do `heap` (também conhecimento como o arquivo que a tabela é armazeada) e  o intervalo dentro da página. Cada registro é um objeto independente que precisa sua própria entrada no índice. **Uma atualização no registro sempre cria uma nova entrada no índice para o registro**.


A degradação do desempenho dos índices é menos grave do que das tabelas por algumas razões. Uma entrada do índice que aponta para um registro morto pode ser marcado como morto. Isso deixa o índice inchado em tamanho mas não leva a fazer pesquisas desnecessárias no `heap`. Atualizações nos registros do `heap` que não afetam a(s) coluna(s) do índice usam uma técnica chamada HOT para fornecer ponteiros para os registros mortos para sua substituição. Isso permite consultas tu reutilizar antigas entradas no índice através do heap.

As considerações do tamanho do inchaço do índice ainda são significativas. Por exemplo, um índice `btree` consiste numa arvore binária de páginas (do mesmo tamanho de páginas que você encontra no `heap`). A página folha contém valores e identificadores de registros. Atualizações aleatórias na tabela tendem a deixar o índice `btree` em forma por que ele pode reutilizar as páginas. Entretanto, inserções ou atualizações assimétricas que afetam um lado da arvore, 

Para verificar se um índice btree é eficiente usando suas páginas você pode perguntar a função `pgstatindex`. A média de densidade da folha é a porcentagem do uso da página de índice de folha:

```sql
SELECT avg_leaf_density FROM pgstatindex('btree_index_name');
```

## Ajustando o AutoVACUUM

O AutoVACUUM deixa o banco de dados rápido e em bom estado. Ele começa a trabalhar quando certas condições configuráveis são atingidas e faz uma pausa quando ele detecta que está sendo muito intrusivo para as consultas.

Para todo banco de dados no cluster, o AutoVACUUM tenta iniciar um worker a cada `autovacuum_naptime` (a cada minuto por padrão). Ele vai rodar no máximo `autovacuum_max_workers` (3 por padrão) a cada vez.

Cada worker procura por uma tabela que precisa de ajuda. O worker procura por tabelas aonde as estatíticas do PostgreSQL indicam um número grande o bastante de registros alterados ao tamanho da tabela. Cada worker em particular procura por uma tabela que filtra `[ESTIMATIVA DE REGISTROS INVALIDADOS] ≥ autovacuum_vacuum_scale_factor * [TAMANHO ESTIMADO DA TABELA] + autovacuum_vacuum_threshold`.

O worker começa removendo os registros mortos da tabela e compactando as páginas. Conforme cada worker avança, ele faz uma contagem de "I/O credits" que eles estão consumindo. Diferentes tipos de ações contam para créditos variáveis (os valores são configuráveis). Quando os créditos usados excedem o `autovacuum_vacuum_cost_limit`, o AutoVACUUM pausa todos os workers em `autovacuum_vacuum_cost_delay` milissegundos.

Executar o vacuum é uma corrida contra o tempo. Quando compacta as páginas, o vacuum worker escaneia o `heap` procurando por registros mortos e adiciona-os numa lista. Ele usa essa lista para primeiro apagar as entradas de ponteiro no índice para essas linhas e então, remove a linha do `heap`. Se há muitos registros para limpar e `maintenance_work_mem` é limitada, o worker não vai conseguir processar muitos registros mortos a cada execução e vai perder tempo repetindo esse processo com mais frequência.

Isso explica uma maneira que o AutoVACUUM fica pra trás: quando há muitos registros mortos acumulados e o AutoVACUUM não possui `maintenance_work_mem` o suficiente para removê-los rapidamente e além disso fica limitado ao `vacuum_cost_limit`. Isso fica nítido em grandes tabelas no banco de dados. Os valores padrão no banco de dados para `autovacuum_vacuum_scale_factor = 0.2` podem ser apropriados para pequenas tabelas, mas é muito grande para tabelas maiores. Você pode configurar o parâmetro por tabela:

```sql
ALTER TABLE <tablename>
  SET autovacuum_vacuum_scale_factor = 0.01;
```  

Isso quer dizer que, para tabelas com milhões de registros, o AutoVACUUM deve iniciar depois de 10 mil registros serem invalidados ao invés de dozentos mil. Isso ajuda a deixar o inchaço sob controle.

AutoVACUUM também pode ficar pra trás quando há mais tabelas inchadas do que que `autovacuum_max_workers` e todas as tabelas continuam a inchar. Workers não coneseguem chegar em todas as tabelas.

Aqui há ajustes sensíveis ao AutoVACUUM. Eles não vão funcionar para todos os bancos de dados, é claro, mas vão te levar pra direção correta.

<table class="table">
	<thead>
		<tr>
			<th>Variável</th>
			<th>PG Default</th>
			<th>Sugestão</th>
		</tr>
	</thead>
	<tbody>
        <tr>
            <td><code>autovacuum_max_workers</code></td>
            <td><code>3</code></td>
            <td><code>5</code> ou <code>6</code></td>
        </tr>
        <tr>
            <td><code>maintenance_work_mem</code></td>
            <td><code>64MB</code></td>
            <td><code>system ram * 3/(8*autovacuum max workers)</code></td>
        </tr>
        <tr>
            <td><code>autovacuum_vacuum_scale_factor</code></td>
            <td><code>0.2</code></td>
            <td>Para grandes tabelas, tente <code>0.01</code></td>
        </tr>
        <tr>
            <td><code>autovacuum_vacuum_threshold</code></td>
            <td><code>50</code></td>
            <td>Pode ser grande para tabelas pequenas</td>
        </tr>
        <tr>
            <td><code>autovacuum_vacuum_cost_limit</code></td>
            <td><code>200</code></td>
            <td>Provavelmente deixe assim</td>
        </tr>
        <tr>
            <td><code>autovacuum_vacuum_cost_delay</code></td>
            <td><code>20ms</code></td>
            <td>Você pode baixar caso esteja OK com mais cara de I/O durante o vacuum</td>
        </tr>
	</tbody>
</table>


## Fique de olho

Após ajustar as configurações do AutoVACUUM, você deve esperar e observar como o banco de dados responde. De fato, você pode querer observar o banco de dados durante um tempo _antes_ de ajustar as configurações pra evitar qualquer otimização prematura. Você deve procurar pela taxa de variação ou pela porcentagem de inchaço nas tabelas e índices.

Utilize esses scripts pra coletar métricas: [pgexperts/pgx_scripts](https://github.com/pgexperts/pgx_scripts/tree/master/bloat). Execute-os na cron job para acompanhar seu progresso semana à semana.


## Divida o trabalho

Tabelas imensas tem um grande potencial para inchaço, tanto da baixa sensibilidade do fator de escala do VACUUM e geralmente devido a extensas rotatividades de registros. Divindido horizontalmente grandes tabelas em pequenas tabelas pode ser útil, especialmente se há um grande numero de workers do AutoVACUUM uma vez que cada workers pode executar uma tabela por vez. Mesmo assim, executar mais workers exigem maiores usos do `maintenance_work_mem`. Uma solução  que, divide grandes tabelas e aumenta a capacidade de executar workers do AutoVACUUM é utilizar um banco de dados distrubuido composto por multiplos servidores PostgreSQL físicos  e tabelas fragmentadas.

Não são apenas consultas de usuário que podem escalar num banco de dados distribuido, o VACUUM também. Pra ser justo, se as consultas estão escalando normalmente numa simples instância PostgreSQL e o único problema é o inchaço, mudar para um sistema distribuído é um exagero; Há outras maneiras de corrigir agressivamente o inchaço agúdo. No entanto, ter mais poder pra executar o VACUUM é um efeito colateral agradável em distribuir o banco de dados. É ainda mais fácil do que nunca distribuir um banco de dados PostgreSQL utilizando ferramentas de código aberto como a [Citus Community Edition](https://github.com/citusdata/citus).

Outra alternativa é dar um passo a frente e esquecer das configurações do AutoVACUUM e utilizar um cluster PostgreSQL gerenciado como o [Citus Cloud](https://www.citusdata.com/product/cloud).