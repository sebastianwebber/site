---
title: "Replicação lógica com o Londiste"
date: 2014-04-18 18:38:04 -0300
comments: true
categories: 
 - PostgreSQL
 - Londiste
---

O objetivo desse post é implementar o londiste, que é uma ferramenta de replicação assincrona do tipo master/slave e faz parte do pacote de ferramentas SkyTools.

Pontos a validar dessa solução:

- Tempo de replicação dos dados
- Tipos de dados suportados, em especial:
    - Sequence
    - Timestamp
    - Bytea

## Sobre o ambiente de testes

O ambiente de testes é composto por 2 servidores linux conforme abaixo:

<table class="table">
    <thead>
        <tr>
          <th></th>
        <th>Master</th>
        <th>Slave</th>
        </tr>
      </thead>
    <tbody>
        <tr>
            <td><b>Hostname</b></td>
            <td>pg-master</td>
            <td>pg-slave</td>
        </tr>
        <tr>
            <td><b>SO</b></td>
            <td>CEntOS 6.5</td>
            <td>CEntOS 6.5</td>
        </tr>
        <tr>
            <td><b>PostgreSQL</b></td>
            <td>9.3.4</td>
            <td>9.3.4</td>
        </tr>
        <tr>
            <td><b>Skytools</b></td>
            <td>3.1.5</td>
            <td>3.1.5</td>
        </tr>
        <tr>
            <td><b>IP</b></td>
            <td>192.168.152.149</td>
            <td>192.168.152.150</td>
        </tr>
    </tbody>
</table>

## Instalação do PostgreSQL

Processo necessário em ambos os servidores.

```bash
cd /tmp
wget -c http://yum.postgresql.org/9.3/redhat/rhel-6-x86_64/pgdg-centos93-9.3-1.noarch.rpm
yum localinstall pgdg-centos93-9.3-1.noarch.rpm
yum install postgresql93-server postgresql93-contrib
service postgresql-9.3 initdb
chkconfig postgresql-9.3 on
```

### Ajustes no firewall

Executar apenas no servidor master:
```bash
iptables -I INPUT -p tcp --dport 5432 -s 192.168.152.149 -j ACCEPT
service iptables save
```

> Nesse lab não foi necessário parar ou ajustar o SELinux.

### Ajustes no postgresql.conf
```bash
listen_addresses = '*'
```

### Ajustes na configuração do pg_hba.conf

Por questão de conveniência, libere acesso a todos os bancos dos servidores citados:

```bash
host    all   postgres    192.168.152.149/32  trust
host    all   postgres    192.168.152.150/32  trust
```

Agora inicie o postgresql:
```bash
service postgresql-9.3 start
```

## Sobre o Londiste

O Londiste é uma ferramenta escrita em python, que utiliza o PgQ para o gerenciamento de eventos. 

O PgQ que é um sistema de filas escrito em PL/pgSQL. Ele é divido em 3 principais funcionalidades:

- **Producers:** coloca eventos em uma determinada fila
- **Ticker:** é um daemon que separa as filas em pacotes de eventos
- **Consumers:** lê eventos de uma determinada fila

Quanto à replicação do londiste, a mesma é controlada pelos nós (nodes), que são classicados como:

- <b>root:</b> é o servidor master da replicação
- <b>branch:</b> é o servidor slave da replicação e permite que outros nós o utilizem para replica de dados em cascata
- <b>leaf:</b> é o servidor slave da replicação e não permite replicação apartir dele

Na prática, cada configuração do nó é um job para processar as filas do PgQ. Para manter as filas atualizadas, um daemon chamado de worker é executado. Varios workers podem ser executados simulâneamente.


O daemon do PgQ, diferente do worker, precisa ter acesso a todos os bancos, para procupar pelos jobs e manter as filas e é por isso que sua string de conexão é parcial (parâmetro `base_connstr`). Seu acesso padrão é realizado ao banco `template1`. 

Recomendo que o daemon do PgQ seja executado do servidor que for o nó root (master) mas nada impede de o mesmo ficar em um servidor isolado.

> É importante lembrar que a solução do Londiste é implementada através de triggers nas tabelas replicadas e isso gera 2 ações necessárias: obrigatoriedade de mesma estrutura de tabelas/colunas e criação de constraints tipo PK e FK nos objetos replicados.

## Instalação do Londiste

```bash
yum install skytools-93 skytools-93-modules
```

Talvez seja necessário reiniciar o postgresql nesse ponto.

## Configuração do londiste

Crie a estrutura de dados em ambos os servidores:

```bash
psql -U postgres -f schema_londiste.sql
```

```sql
-- criação do banco de dados
CREATE DATABASE teste_replica;

\c teste_replica

-- estrutura de dados
CREATE TABLE pessoa (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    data_nascimento DATE NOT NULL,
    ultima_visita TIMESTAMP NOT NULL DEFAULT now(),
    foto BYTEA,
    biografia TEXT
);

-- funções de apoio
CREATE OR REPLACE FUNCTION bytea_import(p_path text, p_result out bytea) 
                   LANGUAGE plpgsql as $$
DECLARE
  l_oid oid;
  r record;
BEGIN
  p_result := '';
  select lo_import(p_path) into l_oid;
  for r in ( select data 
             from pg_largeobject 
             where loid = l_oid 
             order by pageno ) loop
    p_result = p_result || r.data;
  end loop;
  perform lo_unlink(l_oid);
END;
$$;
```

### Servidor master

Crie os diretórios necessários:

```bash
mkdir {/etc,/var/log,/var/run}/londiste
```

Crie o arquivo `/etc/londiste/teste_replica_root.ini`, com o conteúdo abaixo:

```bash
[londiste3]
job_name = teste_replica_root
db = dbname=teste_replica host=192.168.152.149 user=postgres
queue_name = q_teste_replica
logfile = /var/log/londiste/teste_replica_root.log
pidfile = /var/run/londiste/teste_replica_root.pid
```

Quanto aos parâmetros utilizados:

<table class="table table-bordered">
    <thead>
        <tr>
            <th>Propriedade</th>
            <th>Descrição</th>
            <th>Sugestão de valores</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><b>job_name</b></td>
            <td>Nome do Job a ser executado</td>
            <td><pre>[NOME_BANCO]_[TIPO_NODE]</pre></td>
        </tr>
        <tr>
            <td><b>db</b></td>
            <td>Connection String com detalhes de conexão do banco replicado</td>
            <td><pre>host=[PGHOST] port=[PGPORT] dbname=[NOME_BANCO] user=[PGUSER]</pre></td>
        </tr>
        <tr>
            <td><b>queue_name</b></td>
            <td>Nome da fila</td>
            <td><pre>q_[NOME_BANCO]</pre></td>
        </tr>
        <tr>
            <td><b>logfile</b></td>
            <td>Caminho completo do arquivo de log</td>
            <td><pre>/var/log/londiste/[NOME_BANCO]_[TIPO_NODE].log</pre></td>
        </tr>
        <tr>
            <td><b>pidfile</b></td>
            <td>Caminho completo do arquivo pid do worker</td>
            <td><pre>/var/run/londiste/[NOME_BANCO]_[TIPO_NODE].pid</pre></td>
        </tr>
    </tbody>
</table>

> Caso seja necessário um arquivo de exemplo para ajudar a criar as configurações do job, utilize o comando `londiste3 \-\-ini` para gerar um arquivo de exemplo sanar as possíveis dúvidas ou ver as configurações disponíveis.

Após o ajuste das configurações é necessário criar o nó do londiste dentro do banco a ser replicado, assim, execute o comando abaixo:
```bash
londiste3 /etc/londiste/teste_replica_root.ini create-root node1 "dbname=teste_replica host=192.168.152.149 user=postgres"
```

Inicie o daemon para o nó criado:
```bash
londiste3 -d /etc/londiste/teste_replica_root.ini worker
```

> É importante lembrar que para cada novo job é necessário criar um novo arquivo de configuração e a inicialização do job no banco replicado, conforme detalhado acima.

#### Configure o daemon do PgQ

Crie o arquivo `/etc/londiste/pgqd.ini`, com o conteúdo abaixo:

```bash
[pgqd]
base_connstr = host=192.168.152.149 user=postgres
logfile = /var/log/londiste/pgqd.log
pidfile = /var/run/londiste/pgqd.pid
```

> Caso seja necessário um arquivo de exemplo para ajudar a criar as configurações do daemon, utilize o comando `pgqd \-\-ini` para gerar um arquivo de exemplo sanar as possíveis dúvidas ou ver as configurações disponíveis.

Inicie o daemon do PgQ:
```bash
pgqd /etc/londiste/pgqd.ini -d
```

### Servidor slave
Crie o arquivo `/etc/londiste/teste_replica_leaf.ini`, com o conteúdo abaixo:

```bash
[londiste3]
job_name = teste_replica_leaf
db = dbname=teste_replica host=192.168.152.150 user=postgres
queue_name = q_teste_replica
logfile = /var/log/londiste/teste_replica_leaf.log
pidfile = /var/run/londiste/teste_replica_leaf.pid
```

Crie o nó do londiste:
```bash
londiste3 /etc/londiste/teste_replica_leaf.ini create-leaf node2 "dbname=teste_replica host=192.168.152.150 user=postgres" --provider="dbname=teste_replica host=192.168.152.149 user=postgres"
```

Inicie o worker:
```bash
londiste3 -d /etc/londiste/teste_replica_leaf.ini worker
```


## Criando a carga de dados no servidor master

> Note que não é necessário que as tabelas tenham os mesmos dados para iniciar a replicação, apenas a mesma estrutura. 

Copiando os arquivos necessários para o servidor:
```bash
scp /Users/seba/Desktop/28337_1323532011934_4739236_n.jpg root@192.168.152.149:/tmp
```

Ajustando as permissões:
```bash
chown postgres:postgres /tmp/28337_1323532011934_4739236_n.jpg
```

Execute a carga inicial:
```bash
psql -U postgres -d teste_replica -f carga_inicial_londiste.sql 
```

```sql

\c teste_replica

-- carga de dados
INSERT INTO pessoa (nome, data_nascimento, foto, biografia)
WITH config AS (
    SELECT 
      1000 AS max_size
)
SELECT
  'Pessoa ' || new_id::text as nome,
  ('1987-04-16'::DATE + (round(CAST (random()*config.max_size AS NUMERIC),0)::TEXT || ' days')::INTERVAL)::DATE as data_nascimento,
  bytea_import('/tmp/28337_1323532011934_4739236_n.jpg') as foto,
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tristique quam erat, in pellentesque diam feugiat in. In hac habitasse platea dictumst. Mauris malesuada faucibus diam, in tristique arcu dapibus at. Phasellus commodo nulla et orci adipiscing, quis iaculis turpis tincidunt. Proin placerat nisl non molestie porttitor. Curabitur scelerisque libero in lorem consequat consectetur ac a massa. Cras volutpat est ac lacinia ultricies. Donec quis faucibus ligula. Morbi luctus cursus lacus, a fermentum odio dignissim non. Mauris a tellus adipiscing, sodales magna sed, vehicula justo. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla facilisi. Etiam eu augue nec lectus tristique bibendum vitae nec elit. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.' as biografia
FROM
  config,
  generate_series(1,config.max_size) as new_id;
```


## Adicione as tabelas a serem replicadas

### No servidor master
```bash
londiste3 /etc/londiste/teste_replica_root.ini add-table pessoa
```

### No servidor slave
```bash
londiste3 /etc/londiste/teste_replica_leaf.ini add-table pessoa
```

## Testando a replicação

Apartir desse ponto, em alguns segundos, ambos os bancos têm os mesmos registros na tabela pessoa, veja:
```bash
[root@pg-slave ~]# psql -U postgres -d teste_replica -c 'SELECT COUNT(1) FROM pessoa;' -h 192.168.152.149
 count 
-------
  1000
(1 row)

[root@pg-slave ~]# psql -U postgres -d teste_replica -c 'SELECT COUNT(1) FROM pessoa;' -h 192.168.152.150
 count 
-------
  1000
(1 row)
```

Também, não é possível fazer alterações nos registros do servidor slave:
```bash
[root@pg-slave ~]# psql -U postgres -d teste_replica -h 192.168.152.150
psql (9.3.4)
Type "help" for help.

teste_replica=# delete from pessoa;
ERROR:  Table 'public.pessoa' to queue 'q_teste_replica': change not allowed (D)
```

Daqui pra frente, qualquer alteração será replicada (desde que a estrutura da tabela seja a mesma).

Referências:

- https://github.com/markokr/skytools
- http://dba.stackexchange.com/questions/1742/how-to-insert-file-data-into-a-postgresql-bytea-column