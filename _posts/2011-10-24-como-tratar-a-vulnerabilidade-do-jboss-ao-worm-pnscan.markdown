---
author: Sebastian Webber
comments: true
date: 2011-10-24 12:07:48+00:00
layout: post
slug: como-tratar-a-vulnerabilidade-do-jboss-ao-worm-pnscan
title: Como tratar a vulnerabilidade do JBoss ao WORM 'pnscan'
wordpress_id: 137
categories:
- JBoss
tags:
- jboss
- pnscan
- Rapidinhas
- vulnerabilidade
- worm
---

Altere o arquivo '**deploy/jmx-console.war/WEB-INF/web.xml**', removendo as tags abaixo da sessão **security-constraint**:

{% codeblock lang:xml %}
<http-method>GET</http-method>
<http-method>POST</http-method>
{% endcodeblock %}

Deve ficar parecido com isso:
{% codeblock lang:xml %}
<security-constraint>
  <web-resource-collection>
    <web-resource-name>HtmlAdaptor</web-resource-name>
    <description>
       An example security config that only allows users with the role
       JBossAdmin to access the HTML JMX console web application
    </description>
    <url-pattern>/*</url-pattern>
  </web-resource-collection>
  <auth-constraint>
    <role-name>JBossAdmin</role-name>
  </auth-constraint>
</security-constraint>
{% endcodeblock %}

Agora reinicie sua instância.

Mais detalhes/Referência:

  * [http://community.jboss.org/blogs/mjc/2011/10/20/statement-regarding-security-threat-to-jboss-application-server](http://community.jboss.org/blogs/mjc/2011/10/20/statement-regarding-security-threat-to-jboss-application-server)
  * [https://access.redhat.com/kb/docs/DOC-30741](https://access.redhat.com/kb/docs/DOC-30741)
  * [http://community.jboss.org/wiki/SecureTheJmxConsole](http://community.jboss.org/wiki/SecureTheJmxConsole)


