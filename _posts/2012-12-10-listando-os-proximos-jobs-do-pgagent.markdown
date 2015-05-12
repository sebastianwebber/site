---
author: Sebastian Webber
comments: true
date: 2012-12-10 18:45:40+00:00
layout: post
slug: listando-os-proximos-jobs-do-pgagent
title: Listando os próximos jobs do pgagent
wordpress_id: 274
categories:
- PostgreSQL
tags:
- Job
- pgAGent
- PostgreSQL
- Schedule
---

Para listar os próximos jobs, execute a consulta abaixo no banco postgres (ou o banco que tem o pgagent instalado):
{% codeblock lang:sql %}
SELECT 
  pga_job.jobname as job_name,
  pga_jobstep.jstdbname as database_name,
  pgagent.pga_next_schedule(
  pga_schedule.jscid,
  pga_schedule.jscstart,
  pga_schedule.jscend,
  pga_schedule.jscminutes,
  pga_schedule.jschours,
  pga_schedule.jscweekdays,
  pga_schedule.jscmonthdays,
  pga_schedule.jscmonths) as next_run
FROM 
  pgagent.pga_job
  JOIN 
    pgagent.pga_schedule ON pga_schedule.jscjobid = pga_job.jobid 
  JOIN 
  pgagent.pga_jobstep ON pga_jobstep.jstjobid = pga_job.jobid;
{% endcodeblock %}

Por exemplo:
{% codeblock lang:bash %}
[root@server ~]# psql -U postgres
psql (8.4.13)
Type "help" for help.

postgres=# SELECT 
postgres-#   pga_job.jobname as job_name,
postgres-#   pga_jobstep.jstdbname as database_name,
postgres-#   pgagent.pga_next_schedule(
postgres(#   pga_schedule.jscid,
postgres(#   pga_schedule.jscstart,
postgres(#   pga_schedule.jscend,
postgres(#   pga_schedule.jscminutes,
postgres(#   pga_schedule.jschours,
postgres(#   pga_schedule.jscweekdays,
postgres(#   pga_schedule.jscmonthdays,
postgres(#   pga_schedule.jscmonths) as next_run
postgres-# FROM 
postgres-#   pgagent.pga_job
postgres-#   JOIN 
postgres-#     pgagent.pga_schedule ON pga_schedule.jscjobid = pga_job.jobid 
postgres-#   JOIN 
postgres-#   pgagent.pga_jobstep ON pga_jobstep.jstjobid = pga_job.jobid;
        job_name         |   database_name    |        next_run        
-------------------------+--------------------+------------------------
 VACUUM-Job              | banco_prod         | 2012-12-15 04:30:00-02
 VACUUM-Job              | bmark              | 2012-12-15 04:30:00-02
 VACUUM-Job              | postgres           | 2012-12-15 04:30:00-02
 REINDEX-Job             | banco_prod         | 2012-12-15 00:01:00-02
 REINDEX-Job             | bmark              | 2012-12-15 00:01:00-02
 REINDEX-Job             | postgres           | 2012-12-15 00:01:00-02
 ANALYZE-Job             | banco_prod         | 2012-12-15 07:00:00-02
 ANALYZE-Job             | bmark              | 2012-12-15 07:00:00-02
 ANALYZE-Job             | postgres           | 2012-12-15 07:00:00-02
 job_especifico          | banco_prod         | 2012-12-10 16:49:00-02
(10 rows)
{% endcodeblock %}
