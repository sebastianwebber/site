---
title: Um rascunho sobre banco de dados e containers
date: 2016-01-21T17:35:14-03:00
Categories:
 - Docker
Tags:
 - Docker
 - Database
 - Linux
 - PostgreSQL
---

Eu tenho notado que a onda do momento é deixar pra lá a virtualização e passar colocar tudo em container. As pessoas comentam com emoção: minha aplicação rodando no container fica auto-suficiente, configurada conforme os padrões do meu produto e todas as preocupações do fabricante.

Usar o docker e criar um container é relativamente fácil, se você der uma olhada no google, vai achar uma dezena de tutoriais e dicas infalíveis pra deixar tudo rodando como deve. Vou deixar uns links abaixo pra tentar fazer a minha parte.

* [Documentação oficial](https://docs.docker.com/engine/installation/centos/)

O docker tem uma limitação simples: _até o momento, ele só roda no linux_. Temos artificios pra usar o docker no Windows e ou Mac, mas a verdade é que mesmo "com jeitinho", vai ter uma vm linux rodando o docker por debaixo dos panos. Não sei da Apple, mas [a Microsoft ta dando um jeitinho pra rodar ele no Windows Server 2016](https://blog.docker.com/2015/08/tp-docker-engine-windows-server-2016/).


> <strong>O que isso quer dizer?</strong>
>
> Quer dizer que, no atual momento, docker só funciona no linux.

Se você ficou curioso sobre como usar ele no windows ou mac, dá uma olhada no [Kitematic](https://kitematic.com/).

Bom, depois de discurso todo eu quero dizer uma coisa bem simples: Se sua aplicação precisa do Windows pra rodar (seja pelo SQL Server, IIS, etc) acho que esse post não é bem pra você.

É comum usarmos docker para rodar nossa aplicação web, seja ela como for: ERP rodando em java, blog em php, etc. A idéia é simples: a gente sobe um container com o mínimo pra ela rodar e gentilmente manda o docker rodar muitas instancias dessa mesma imagem simultaneamente. Pensando assim você indaga: Se precisar um balanceador de carga, o que fazemos? Subimos ele num container também. Fácil assim.

Quer um exemplo? Suponha que tenhamos que publicar um blog feito no wordpress. Wordpress precisa do php e um banco MySQL pra funcionar. Dessa forma, precisamos, **necessariamente** de 2 containers: 1 de MySQL e outro de apache+php (ou qualquer outro webserver que rode php e te deixe feliz).

Assim que nosso servidor estiver rodando esses containers e nosso blog imaginario começa a receber muitos acessos, nosso container de apache e php começa a ter dificuldade de responder a todas as requisições e assim, temos a grande idéia de colocar mais um container rodando apache com minha aplicação (wordpress) e assim, ganhamos um problema novo: tenho 2 apaches e nimguém pra balancear o mesmo. 

O que fazer nesse caso? você pode subir um [container com o haproxy](https://hub.docker.com/_/haproxy/) e passar a apontar tuas requisições pra ele e ele passar a balancear as conexões entre os apaches. Até que é facil não é? agora, se o site ficar lento denovo, o que a gente faz? aumenta os apaches! Quantos? Quantos forem necessários!!! :D

> **Agora, quando baixou a demanda, o que eu faço?**

> Diminuo a quantidade de containers em execução, fazendo manualmente um [autoscaling](https://en.wikipedia.org/wiki/Autoscaling).

Talvez aqui tenhamos um furo no conceito: a aplicação do wordpress vai eventualmente criar uns arquivos no disco com dados da aplicação (imagens, css, js, etc) e isso a gente pode contornar com uma area de disco compartilhada entre os containers.

A analogia é simples nesse caso: cada imagem docker tem tudo que eu preciso pra rodar o php+wordpress+coisas+do+blog e o MySQL é quem guarda os dados dinamicos.

Então vai chegar o temido dia: meu banco rodando no container não dá conta do recado. Você tenta todo tipo de mandinga necessária: tunning, hardware e não tem jeito. Aí, depois de pensar em todos os planos pra aumentar os recursos passa pra pensar em algum tipo de processamento horizontal e nota que vai precisar distribuir a carga e balancear os acessos entre esses nós. Assim, você que já foi doutrinado vai dizer: "ótimo! vou colocar a rodar mais um haproxy e vou subir outro container MySQL!". Não, isso não vai funcionar.

Por que? basicamente por causa da integridade dos dados. Precisamos de algum mecanismo (seja nativo ou não) que garanta que ambas os containers rodando MySQL tenham a mesma informação. Isso não é tão simples: cada fabricante de banco de dados implementa do seu jeito e cada solução de replicação tem seus prós e contras.

Tá, mas o MySQL não tem replicação? eu não posso usar pra resolver meu problema? Pode. E posso fazer igual como fiz com os apaches+php, apagando os containers conforme ele não for usado? Provavelmente não. 

Aqui é o ponto em questão: bancos de dados não apenas arquivos no disco. Precisamos pensar uma forma diferente de tratar ele pra que funcione bem como de costume.

Quanto ao armazenamento, tem alguns links que valem a pena dar uma olhada:

* [http://stackoverflow.com/questions/18496940/how-to-deal-with-persistent-storage-e-g-databases-in-docker](http://stackoverflow.com/questions/18496940/how-to-deal-with-persistent-storage-e-g-databases-in-docker)
* [http://container42.com/2013/12/16/persistent-volumes-with-docker-container-as-volume-pattern/](http://container42.com/2013/12/16/persistent-volumes-with-docker-container-as-volume-pattern/)
* [https://docs.docker.com/engine/userguide/dockervolumes/](https://docs.docker.com/engine/userguide/dockervolumes/)
* [http://container42.com/2014/11/18/data-only-container-madness/](http://container42.com/2014/11/18/data-only-container-madness/)


Continua...




