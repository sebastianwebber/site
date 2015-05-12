---
layout: post
title: "Computando os erros mais frequentes no server.log do JBoss EAP/Wildfly"
date: 2014-07-17 14:14:52 -0300
comments: true
categories: 
 - BASH
 - Linux
 - JBoss
 - Wildfly
---

Execute o script abaixo, substituindo o diretório <code>/var/log/jbossas</code> pelo diretório de logs do seu servidor JBoss/Wildfly:
> Nesse exemplo estou procurando os arquivos de log dos últimos 7 dias. ;)
{% codeblock lang:bash %}
egrep --color=auto 'ERROR \[[a-zA-Z\.]{1,}\]' $(find /var/log/jbossas/ -ctime -7 | grep server) -o  | awk '{print $2}' |  sort | uniq -c | sort -r | head -n 10
{% endcodeblock %}

Por exemplo:
{% codeblock lang:bash %}
[root@servidor ~]# egrep --color=auto 'ERROR \[[a-zA-Z\.]{1,}\]' $(find /var/log/jbossas/ -ctime -7 | grep server) -o  | awk '{print $2}' |  sort | uniq -c | sort -r | head -n 10
   1864 [org.codehaus.groovy.grails.web.errors.GrailsExceptionResolver]
    716 [grails.app.controllers.ar.com.site.app.acesso.LoginController]
    475 [stderr]
    254 [org.grails.plugin.resource.ResourceMeta]
     88 [grails.app.services.ar.com.site.app.banner.BannerService]
     84 [StackTrace]
     46 [org.hibernate.util.JDBCExceptionReporter]
     27 [grails.app.daos.ar.com.site.app.ecommerce.PedidoOracleDao]
     26 [grails.app.taglib.ar.com.site.app.banner.BannerTagLib]
     15 [org.hibernate.transaction.JDBCTransaction]
{% endcodeblock %}

Agora, podemos jogar tudo num script, dando uma ajustada na apresentação:
{% codeblock lang:bash %}
#!/bin/bash

search_dir="${1}"

if [ "${search_dir}x" = 'x' ]; then
    echo 'Informe o diretório de busca!'
    exit 2
fi

error_list=$(egrep --color=auto 'ERROR \[[a-zA-Z\.]{1,}\]' $(find -L "${1}" -ctime -7 | grep server) -o  | awk '{print $2}' |  sort | uniq -c | sort -r | head -n 10)

seq=1
echo
printf '%-2s | %-10s | %-100s | \n' "#" "COUNT" "LOGGER NAME"
echo "---|------------|------------------------------------------------------------------------------------------------------|"

IFS='
'
for error in ${error_list}; do
    count=$(echo "${error}" | awk '{print $1}')
    logger_name=$(echo "${error}" | awk '{print $2}' | tr -d '[]')

    printf '%-2s | %-10s | %-100s | \n' "${seq}" "${count}" "${logger_name}"

    seq=$(($seq + 1))
done
echo
{% endcodeblock %}

Por exemplo:
{% codeblock lang:bash %}
[root@servidor ~]# ./procura_erros.sh /var/log/jbossas/

#  | COUNT      | LOGGER NAME                                                                                          |
---|------------|------------------------------------------------------------------------------------------------------|
1  | 1926       | org.codehaus.groovy.grails.web.errors.GrailsExceptionResolver                                        |
2  | 759        | grails.app.controllers.ar.com.site.app.acesso.LoginController                                 |
3  | 475        | stderr                                                                                               |
4  | 265        | org.grails.plugin.resource.ResourceMeta                                                              |
5  | 90         | grails.app.services.ar.com.site.app.banner.BannerService                                      |
6  | 84         | StackTrace                                                                                           |
7  | 46         | org.hibernate.util.JDBCExceptionReporter                                                             |
8  | 27         | grails.app.taglib.ar.com.site.app.banner.BannerTagLib                                         |
9  | 27         | grails.app.daos.ar.com.site.app.ecommerce.PedidoOracleDao                                     |
10 | 15         | org.hibernate.transaction.JDBCTransaction                                                            |

{% endcodeblock %}

Caso precisem de um exemplo do erro em questão, utilize o comando abaixo:
{% codeblock lang:bash %}
pcregrep -Mi '.*ERROR \[NOME_DO_PACKAGE.*(\n.*(\n\s*at.*)+)?' $(find /var/log/jbossas/ -ctime -7 | grep server)
{% endcodeblock %}
> Lembre de substituir o <code>NOME_DO_PACKAGE</code> pelo package que você está procurando.

Acho que é isso por hoje.