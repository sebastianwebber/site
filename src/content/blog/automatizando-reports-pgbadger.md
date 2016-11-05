+++
date = "2013-11-04T00:58:11-02:00"
draft = false
title = "Automatizando os reports do PGBadger"
Categories = [ "PostgreSQL" ]
Tags = [ "LogRotate", "PGBadger", "PostgreSQL",  "Syslog" ]

+++

Minha idéia com esse post é 'despejar' uma série de scripts e configurações pra que o [pgbadger](http://dalibo.github.io/pgbadger/) gere quase que automaticamente os reports, seguindo a regra de tempo abaixo:
	
- Report dos últimos 30min
- da última 1h
- das últimas 3h
- das últimas 6h
- do último dia
- da última semana


Além da configuração padrão, sugerida no site do próprio pgbadger, é necessário configurar o syslog, para que ele direcione os logs do postgres para um arquivo separado, assim, adicione esse trecho no arquivo /etc/rsyslog.conf:
    
```bash
local0.*        -/var/log/pgsql/pgsql.log
```

> Pode ser necessário criar o diretório /var/log/pgsql, se explodir qualquer erro aí, confirme se o mesmo foi criado. :D



Após isso, dê um reload no serviço e os logs do postgres serão criados nesse diretório.

É necessário configurar o LogRotate para que o mesmo rotacione os logs. Baseado nas regras acima, crie o arquivo `/etc/pgsql/cron.logrotate`:

```bash
/var/log/pgsql/pgsql.log {
    missingok
    rotate 1488
    nomail
    sharedscripts
    create 0660 root root
    postrotate
    /etc/init.d/rsyslog restart
    /etc/init.d/postgresql-9.2 reload
    endscript
}
```

Crie um script para gerar os reports, chamado update_badger.sh:
```bash
#!/bin/bash

filter_mask="$1"
filter_mask_cmd='mmin'
file_name="/var/www/html"

if [ $filter_mask = "30min" ]; then
  filter_mask=30
  file_name="${file_name}/index.html"
elif [ $filter_mask = "1h" ]; then
  filter_mask=60
  file_name="${file_name}/last-1h.html"
elif [ $filter_mask = "3h" ]; then
  filter_mask=300
  file_name="${file_name}/last-3h.html"
elif [ $filter_mask = "6h" ]; then
  filter_mask=600
  file_name="${file_name}/last-6h.html"
elif [ $filter_mask = "1d" ]; then
  filter_mask=1
  filter_mask_cmd='mtime'
  file_name="${file_nam3e}/last-day.html"
elif [ $filter_mask = "1w" ]; then
  filter_mask=7
  filter_mask_cmd='mtime'
  file_name="${file_name}/last-week.html"
fi

echo
echo $(date) - Generating ${file_name} file...
echo
/usr/bin/pgbadger $(/bin/find /var/log/pgsql/ -${filter_mask_cmd} -$filter_mask -type f) -o ${file_name}
/bin/chown apache:apache ${file_name}
/bin/chmod 755 ${file_name}

if [ ${filter_mask} -eq 30 ]; then
  echo $(date) - Rotating log file
  /usr/sbin/logrotate -f /etc/pgsql/cron.logrotate
fi
echo $(date) - Done.
```


> Note que nesse script, o log rotate é chamado (com a configuração descrita anteriormente) a cada 30min. Assim, não é necessário configurar o crontab ou similar pra fazer esse trabalho sujo. ;)



Agora, agende a geração dos reports no cron:

```bash
# pgbadger reports
*/30 * * * * /opt/resources/update_badger.sh 30min >> /var/log/pgbagder.log 2>&1
00 */1 * * * /opt/resources/update_badger.sh 1h >> /var/log/pgbagder.log 2>&1
00 */3 * * * /opt/resources/update_badger.sh 3h >> /var/log/pgbagder.log 2>&1
00 */6 * * * /opt/resources/update_badger.sh 6h >> /var/log/pgbagder.log 2>&1
00 00 * * * /opt/resources/update_badger.sh 1d >> /var/log/pgbagder.log 2>&1
00 00 * * Sat /opt/resources/update_badger.sh 1w >> /var/log/pgbagder.log 2>&1
```

Pra finalizar, eu fiz uma pequena modificação no pgbadger, para que ele mostre um pequeno menu dropdown com os horários dos reports disponíveis. Você pode fazer download do mesmo no github: [https://github.com/sebastianwebber/pgbadger](http://github.com/sebastianwebber/pgbadger).

Todo caso, fica aí um screenshot da minima modificação que fiz (só pra dar um gostinho):

![screenshot](/wp-content/uploads/2013/11/badger_custom.png)