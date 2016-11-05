+++
date = "2016-02-15T16:54:52-02:00"
draft = false
title = "Checklist mensal do PostgreSQL"
Categories = [ "PostgreSQL" ]
Tags = [ "Database", "Checklist", "PostgreSQL",  "Backup", "HA" ]

+++

Este post é uma humilde adaptação de um [ótimo artigo sobre o SQL Server](http://www.jasonstrate.com/monthly-sql-server-checklist/). Sim, você leu certo: Peguei umas idéias do checklist do SQL Server.


## 1. Atualize o SO do seu servidor

Eu sei. Você não faz isso. Acha que não precisa, que o problema não é seu, mas nos últimos anos tivemos tantos problemas de segurança recentes ([HeartBleead](http://heartbleed.com), [Shellshock](https://access.redhat.com/articles/1200223), etc), que sabe-se lá o que pode nos assustar no futuro. Quer uma sugestão? Atualiza tudo, sempre [que possível].

## 2. Atualize seu servidor PostgreSQL

Por que? por que sim, oras. Precisa de mais motivos? Então pensa que BUGs e falhas de segurança são corrigidos o quanto antes. 

Sua versão instalada não tem mais atualizações ou não é mais suportada? Para tudo e bora atualizar. Não só pela segurança, mas toda versão tem muita coisa bacana, aposto que os desenvolvedores implorariam pra você atualizar. Vai lá e mostra o release notes pros caras, depois vem e me agradece. :P

Não acredita? Abre aí então:

> [`https://wiki.postgresql.org/wiki/What's_new_in_PostgreSQL_9.5`](https://wiki.postgresql.org/wiki/What's_new_in_PostgreSQL_9.5)


Pra te dar uma dica de como atualizar, sempre dê uma lida no release notes. Lá tem tudo o que nós, meros mortais (_ou não devs_), precisavamos saber pra atualizar o banco. Normalmente é bem simples (para o banco, atualiza os binários, sobe o banco), e caso seja mais elaborado, vai estar la no release notes, bem bonitinho. 

Quer saber das versões novas e tem preguiça de ver o site toda hora? Então assine o [feed RSS](http://www.postgresql.org/versions.rss). 

Ainda assim da muito trabalho? Então utilize os repositórios do PGDG, que tem pra varios sabores ([APT](https://wiki.postgresql.org/wiki/Apt) e [YUM](https://wiki.postgresql.org/wiki/RPM_Installation)  por exemplo).

## 3. Valide suas rotinas de backup

Verifique todo seu processo de backup. Messa os tempos de execução, documente cada etapa do processo e tente deixar ele o mais simples possível. Pontos importantes a validar são: _Tamanho ocupado_, _duração_, _falhas na execução_ e _monitoramento do mesmo_.

Já que estamos falando de backup, faça a lição de casa e avalie as soluções de backup mais populares:

 * [DOC Oficial](http://www.postgresql.org/docs/current/static/backup.html)
 * [pgbarman](http://www.pgbarman.org)
 * [pg_arman](https://github.com/michaelpq/pg_arman)
 * [scripts customizados do @depesz](http://www.depesz.com/2013/09/11/how-to-make-backups-of-postgresql/)

Já que você faz backup do seu banco, não esqueça de fazer backup das suas configurações. Afinal, nunca se sabe quando vamos precisar fazer um `Disaster Recovery`. Falando nisso, é uma boa planejar uma solução de `HA`, não é mesmo?

> Se você ainda usa o `pg_dump` como sua principal solução de backup, dá uma olhada nesse [artigo bacana do @telles](http://savepoint.blog.br/dump-nao-e-backup/).

## 4. Teste, _com vontade_, a sua rotina de restore

> Backup bom é o que restaura. 

Eu nunca canso de dizer isso! 

Já que seu backup está rodando certinho, faça um restore dos dados. Meça os tempos, documente o processo. Se tiver como fazer isso num servidor novo, melhor aínda! O importante é ficar tranquilo e ter tudo sob controle quando a casa cair e ele for realmente necessário.

## 5. Verifique o desempenho e a saude do seu banco

Deixe de sofrer. Há muitas soluções de monitoramento no mercado ([zabbix](http://www.zabbix.com), [Nagios](https://www.nagios.org/), etc). Coloque ele pra funcionar e monitorar detalhes uteis do SO e também do servidor PostgreSQL. Ajuste seu log para um formato de leitura mais eficiente (como o CSV, por exemplo) e gere reports do [pgbadger](http://dalibo.github.io/pgbadger/) ou [uma solução mais elaborada](https://prezi.com/f2dvt6m9tbf9/integrating-postgresql-with-logstash-for-real-time-monitoring/).

Caso você use a versão 9.3 ou superior, você **DEVE** dar uma olhada no [PoWA](http://dalibo.github.io/powa/).

## 6. Revise seu tuning no SO e no `postgresql.conf`

Agora que você passou a monitorar o banco, aproveita o embalo e começa a dar uma revisada no tuning do sistema operacional, começando pelo `/etc/sysctl.conf`. Infelizmente, cada evento pode apontar um arquivo de configuração diferente. O jeito fácil é entender o que está rolando no servidor e ver se isso tu trata num dos **3 pilares**: _Hardware_, _Sistema Operacional_ e _Banco de dados_.

SO revisado? Então manda ver e da uma olhada configurações do `postgresql.conf`. Se você nunca fez isso, eu sugiro que dê uma olhada no [PGConfig](http://pgconfig.org). Lá é um bom lugar pra começar.

Não esqueça do hardware. As vezes não tem jeito, precisamos de um upgrade. :D

## 7. Analise e ajuste o baseline

Chegou a conclusão que precisa de algum ajuste no tuning? O que mudou? Aumentou a quantidade de usuários? Nova feature baseado em [boas praticas do mercado](http://desciclopedia.org/wiki/Gambi_Design_Patterns)?

Será que é realmente necessário esse ajuste?

## 8. Valide o seu [Capacity Plan](https://en.wikipedia.org/wiki/Capacity_planning)

Se você tem um em ação, será que o mesmo está adequado? Se você fez algum ajuste sugerido acima, será que o mesmo não precisa de nenhum ajuste? Talvez seja o momento de mudar algumas projeções.


## 9. Sumarize e monte um plano

Avaliou tudo o que precisa mudar? Agora monte o seu proprio plano de ação, alinhe com a equipe e batalhe pelas janelas de manutenção.

Depois de tudo pronto e configurado, mande o seu próprio release notes pro pessoal do marketing e deixe eles fazerem propaganda da saude do seu banco! :P

## Faltou algo?

Certamente algo importante pode ter ficado pra trás. Deixa um comentário pra gente ajustar assim que der. :D

[]'s