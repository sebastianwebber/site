+++
date = "2013-07-26T19:53:44-02:00"
title = "Diferenças entre Domain Mode e Standalone Mode no JBoss EAP 6/AS 7"
draft = true
Categories = [ "JBoss" ]
Tags = [ "Wildfly", "Jboss", "Domain Mode", "Standalone", "AS7", "EAP" ]

+++

A única diferença é quanto ao gerenciamento.

Basicamente:

- Domain mode não suporta deploy diretamente no filesystem, isso quer dizer que não é possível fazer deploy de EAR/WAR/SAR aberto
- Domain mode permite gerenciamento centralizado de todas as instâncias JBoss do ambiente, porém há algumas limitações (ou problemas conhecidos) quanto a disponibilidade do domain causam instabilidade no ambiente:
- Caso o HostController (HC) seja reiniciado mas o DomainController (DC) permaneça disponível, o HC não identifica a queda desse HC e quando ele tenta conectar novamente, o mesmo acusa que ele já está registrado.
- Caso o DC esteja indisponível durante o inicio do HC, não é possível inicia-lo. É possível, claro, iniciar o HC com backup da ultima configuração disponível (usando os parâmetros —backup e —cached-dc).
- Caso o DC fique indisponível mas o HC permaneça no ar, não há problemas.
- Normalmente Standalone mode é utilizado para ambiente de desenvolvimento, principalmente pela simplicidade do ambiente, porém nada impede de usar Domain mode para gerenciar todas as instâncias JBoss do ambiente de desenvolvimento.
- Standalone mode mantem cada instância com a configuração isolada, assim é possível que ocorra alguma divergência da configuração entre os servers, todo caso, é possível criar alguma ferramenta que ajuste os arquivos de configuração em todas as instâncias simultaneamente. Normalmente grandes alterações na configuração do ambiente somente ocorrem durante a implantação do mesmo. Assim, mesmo que trabalhoso, não é realmente um problema.

E quanto ao deploy:

- DomainMode faz, por padrão, deploy em todas as as instâncias do grupo simultaneamente o que pode causar indisponibilidade da aplicação durante esse tempo. É possível usar a opção rollup-to-servers para contornar o problema, porém a mesma só está disponível pelo JBoss-CLI. Para quem utiliza o JON (ou RHQ) para gerenciar os deploys, a opção rollup-to-servers não está disponível.
- No StandaloneMode o deploy deve ser realizado uma instância de cada vez. Assim o JON (ou RHQ) tende a ser uma ferramenta essencial no processo.

Referências:

- [https://access.redhat.com/site/solutions/399683](https://access.redhat.com/site/solutions/399683)
- [https://access.redhat.com/site/solutions/237813](https://access.redhat.com/site/solutions/237813)
- [https://issues.jboss.org/browse/AS7-3852](https://issues.jboss.org/browse/AS7-3852)