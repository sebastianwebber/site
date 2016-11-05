+++
title = "Script de inicialização para o JBoss EAP/AS"
draft = false
date = "2012-07-04T18:00:40-02:00"
Categories = [ "JBoss", "Wildfly", "Script" ]
Tags = [ "Gist", "Startup", "System-v", "init.d" ]

+++


**UPDATE Oct/2012**:

- Após 30 tentativas de matar o processo, dá um ‘kill -9’ nele! 
- Antes de iniciar o serviço , apaga os arquivos da pasta tmp e work da instância.

**UPDATE Feb/2014**:

- Move o arquivo console.log para YYYY-DD-MM_console.log após o stop. 
– Antes do stop ou start, é testado se a instância já está rodando. Caso esteja rodando o start é abortado, caso não esteja o stop é abortado, de acordo com cada operação. – Ajustado a chamada do metodo de limpeza (do_cleanup). agora chamado no método de startup (do_start).

**UPDATE Feb/2014**:

- caso o diretório de log da instância não exista, o mesmo será criado durante do startup

**UPDATE Nov/2016**:

- Atualizando para um novo script, agora no gist.

{{< gist sebastianwebber 10837e4003b84f626842 >}} 
 
