---
title: Desafio sobre a replicação do PostgreSQL!
date: 2016-01-21T20:05:03-02:00
lastmod: 2017-03-11T20:05:03-02:00
Categories:
 - PostgreSQL
Tags:
 - Database
 - Replication
 - PostgreSQL
---

Esse ano, [segundo fontes confiáveis](http://savepoint.blog.br/10-anos-de-pgbr/), é aniversário da Comunidade Brasileira de PostgreSQL. E pra fazer a minha parte (e tirar a poeira do blog) eu lanço um desafio público: falar sobre a replicação do PostgreSQL. E isso não é pouca coisa!

Até o momento, essas são as soluções mais populares:

 * Replicação Nativa: [Streaming Replication](http://www.postgresql.org/docs/current/static/warm-standby.html#STREAMING-REPLICATION) e [Replication Slots](http://www.postgresql.org/docs/current/static/warm-standby.html#STREAMING-REPLICATION-SLOTS)
 * [BDR](http://2ndquadrant.com/en-us/resources/bdr/)
 * [PGLogical](http://2ndquadrant.com/en/resources/pglogical/)
 * [Slony](http://slony.info/)
 * [Londiste](https://wiki.postgresql.org/wiki/SkyTools#Londiste)
 * [Bucardo](https://bucardo.org/wiki/Bucardo)
 * [Mimeo](http://www.keithf4.com/mimeo-introduction/)
 * [PGpool II](http://www.pgpool.net/mediawiki/index.php/Main_Page)
 * [REPMgr](http://www.repmgr.org/)

## A proposta

A idéia é fazer um ambiente de testes utilizando a versão mais recente do banco e da solução cobrindo os pontos abaixo:

 * Instalação e configuração
 * Operação basica para replicar dados ou conjunto de dados
 * Procedimentos que previnem tolerancia a falhas
 * Validar meios para replicar dados distribuidos geograficamente
 * Medição dos tempos de carga intensa (como o restore do banco) e moderado (como a atualização de dados e tudo mais)
 * Avaliação de pontos fortes e fracos

## Sobre o ambiente de testes

### Quanto a máquina virtual dos testes

Pra simplificar o processo de setup do lab, eu criei uma configuração do [Vagrant](https://www.vagrantup.com/) composta de duas máquinas virtuais na configuração abaixo:

 * 2GB de RAM
 * 35GB espaço em disco
 * CEntOS 7 64 Bits
 * Repositórios configurados: epel, pgdg94 e pgdg95

Detalhes da configuração de rede:

<table class="table">
	<thead>
		<tr>
			<th>Hostname</th>
			<th>IP</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>master</td>
			<td>192.168.100.100</td>
		</tr>
		<tr>
			<td>slave</td>
			<td>192.168.100.200</td>
		</tr>
	</tbody>
</table>



Abaixo segue o Vagrantfile:
{{< gist sebastianwebber d49ac8507d48c9cfdc4f "Vagrantfile.rb" >}}

Para utiliza-lo, execute:


{{< gist sebastianwebber d49ac8507d48c9cfdc4f "setup.sh" >}}


### Quanto a base de dados

A base de testes adotada é o banco do [IMDB](http://www.imdb.com/). Pra simplificar o processo de importação e teste eu já deixei um dump prontinho na URL abaixo:

 > [`http://1drv.ms/1TjlPXl`](http://1drv.ms/1TjlPXl)

Detalhes pra importação do dump são os de sempre:
```bash
createdb -U postgres imdb
pg_restore -U postgres -d imdb -Fc --disable-triggers imdb.dump -j 4
vacuumdb -U postgres -d imdb -z
```

Na sequência já publico detalhes de como popular e alterar os dados.

E aí, vai encarar?
