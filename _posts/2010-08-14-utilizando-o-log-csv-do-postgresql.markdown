---
author: Sebastian Webber
comments: true
date: 2010-08-14 17:32:36+00:00
layout: post
slug: utilizando-o-log-csv-do-postgresql
title: Utilizando o log CSV do PostgreSQL
wordpress_id: 33
categories:
- PostgreSQL
tags:
- csv
- log
- PostgreSQL
- sql
---

Uma das novidades bacanas da versão 8.3 do PostgreSQL foi a possibilidade de gerar os logs do banco no formato [CSV](http://pt.wikipedia.org/wiki/Comma-separated_values). Quando eu precisei de uma forma mais eficiente de analisar os logs do banco eu assumi o seguinte raciocínio: "com o csv eu posso criar minha super aplicação .net para extrair os dados e dai pensei: se fosse só uma tabela, é só dar um select!". Abaixo eu dou mais detalhes de como isso faz sentido.

Na [documentação](http://www.postgresql.org/docs/8.4/static/) eu encontrei toda a [estrutura da tabela e como importar o arquivo](http://www.postgresql.org/docs/8.4/static/runtime-config-logging.html#RUNTIME-CONFIG-LOGGING-CSVLOG). Mas antes de começarmos, vamos alterar algumas configurações no postgresql.conf:

Segue exemplo das configurações no postgresql.conf:
{% codeblock lang:bash %}
# habilito o log em csv
log_destination = 'csvlog'
# habilito o coletor de estatisticas
logging_collector = on
# defino que grave no log a duração dos comandos executados
log_duration = on
# defino para gravar todas as consultas no log
log_statement = 'all'
{% endcodeblock %}

Após alterar as configurações, reinicie o serviço.

Segue a estrutura da tabela que iremos importar o log:
{% codeblock lang:sql %}
CREATE TABLE postgres_log
(
  log_time timestamp(3) with time zone,
  user_name text,
  database_name text,
  process_id integer,
  connection_from text,
  session_id text,
  session_line_num bigint,
  command_tag text,
  session_start_time timestamp with time zone,
  virtual_transaction_id text,
  transaction_id bigint,
  error_severity text,
  sql_state_code text,
  message text,
  detail text,
  hint text,
  internal_query text,
  internal_query_pos integer,
  context text,
  query text,
  query_pos integer,
  location text,
  PRIMARY KEY (session_id, session_line_num)
);
{% endcodeblock %}

Com a tabela criada, vamos importar o log (Repita o processo sempre que quiser atualizar a tabela com os dados do arquivo de log):
{% codeblock lang:sql %}
TRUNCATE postgres_log;
COPY postgres_log FROM '/caminho/do/pgdata/pg_log/main_log.csv' WITH csv;
{% endcodeblock %}

Com a tabela atualizada podemos criar diversas consultas, como não sou muito criativo, vou [roubar o exemplo do pgFouine](http://pgfouine.projects.postgresql.org/reports/sample_default.html#normalizedqueriesmostfrequentreport):

Most frequent queries:
{% codeblock lang:sql %}
CREATE TEMP SEQUENCE rank_seq;
WITH
  custom_log AS ( 
    SELECT
      REGEXP_REPLACE(REGEXP_REPLACE(MESSAGE, '[0-9]{1,}', '0', 'g'), '''.*?''', '''''', 'g') AS MESSAGE,
      session_id,
      session_line_num
    FROM
      postgres_log
  ), summary AS (
    SELECT
      substring(custom_log.message, 12, LENGTH(custom_log.message)) AS consulta,
      COUNT(custom_log.message) AS quantidade_execucoes,
      AVG(SUBSTR(dur.message, 10, LENGTH(dur.message))::interval) AS tempo_medio,
      SUM(SUBSTR(dur.message, 10, LENGTH(dur.message))::interval) AS tempo_total
    FROM
      custom_log
      LEFT JOIN postgres_log dur
      ON
        custom_log.session_id               = dur.session_id
        AND custom_log.session_line_num + 1 = dur.session_line_num
    WHERE
      custom_log.message LIKE 'statement%'
      AND dur.message    LIKE 'duration%'
    GROUP BY
      custom_log.message
    ORDER BY
      2 DESC
    LIMIT
      10
  )
  SELECT
      nextval('rank_seq')::INT AS rank,
      summary.tempo_medio AS AvDuration,
      summary.quantidade_execucoes::INT AS TimesExecuted,
      summary.tempo_total AS TotalDuration,
      summary.consulta::text AS Query
    FROM
      summary;
{% endcodeblock %}

Espero que seja útil.

[]'s
