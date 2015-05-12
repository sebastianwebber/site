---
author: Sebastian Webber
comments: true
date: 2011-10-24 17:22:40+00:00
layout: post
slug: instalando-o-client-do-xenapp-no-fedora-16
title: Instalando o client do XenApp no fedora 16
wordpress_id: 146
categories:
- Citrix
- Fedora
tags:
- Citrix
- Fedora 16
- Linux
- Metaframe
- Receiver
- XenApp
---

Faça download do pacote .rpm no site abaixo:
[ http://www.citrix.com/English/ss/downloads/details.asp?downloadId=2316611&productId=1689163#top](http://www.citrix.com/English/ss/downloads/details.asp?downloadId=2316611&productId=1689163#top)

Instale o pacote:
{% codeblock lang:bash %}
sudo yum localinstall ICAClient-12.0.0-0.x86_64.rpm
{% endcodeblock %}

Crie o link simbólico para o plugin:
{% codeblock lang:bash %}
sudo ln -s /opt/Citrix/ICAClient/npica.so /usr/lib64/mozilla/plugins/npica.so
{% endcodeblock %}

Para abrir o arquivo automáticamente, selecione o script abaixo para o "programa padrão"
{% codeblock lang:bash %}
/opt/Citrix/ICAClient/wfica.sh
{% endcodeblock %}

**Troubleshooting**

> /opt/Citrix/ICAClient/wfica: error while loading shared libraries: libasound.so.2: cannot open shared object file: No such file or directory


Solução:
{% codeblock lang:bash %}
sudo yum install alsa-lib.i686
{% endcodeblock %}



> SSL Error
Contact your help desk with the following information:
You have not chosen to trust "MEU CERTIFICADO", the issuer of ther servers's security certicate (SSL error 61).


Solução:
{% codeblock lang:bash %}
# copie seus certificados para a pasta de instalação do cliente
sudo cp *cer /opt/Citrix/ICAClient/keystore/cacerts/
{% endcodeblock %}


