---
author: Sebastian Webber
comments: true
date: 2013-01-22 19:30:00+00:00
layout: post
slug: listando-as-10-maiores-tabelas-no-postgresql
title: Listando as 10 maiores tabelas no PostgreSQL
wordpress_id: 315
categories:
- PostgreSQL
tags:
- PostgreSQL
- Rapidinhas
- Tabelas
- Tamanho objetos
---

Para listar as maiores tabelas do seu banco de dados, utilize a consulta abaixo:
{% codeblock lang:sql %}
WITH table_stats AS (
  SELECT
    schemaname,
    tablename,
    pg_relation_size(schemaname || '.'|| tablename) as table_size,
    (pg_total_relation_size(schemaname || '.'|| tablename) - pg_relation_size(schemaname || '.'|| tablename)) as index_size,
    pg_total_relation_size(schemaname || '.'|| tablename) as total_size
  FROM
    pg_tables
)
SELECT 
  table_stats.schemaname,
  table_stats.tablename,
  pg_size_pretty(table_stats.table_size) as table_size,
  pg_size_pretty(table_stats.index_size) as index_size,
  pg_size_pretty(table_stats.total_size) as total_size
FROM 
  table_stats

WHERE 
  -- ajuste o filtro conforme sua necessidade!
  table_stats.schemaname = 'public'
ORDER BY 
  table_stats.total_size desc,
  table_stats.index_size desc,
  table_stats.table_size desc
LIMIT 10;
{% endcodeblock %}
