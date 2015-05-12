---
layout: post
title: "Snippet para abortar a execução de um script BASH"
date: 2014-07-16 09:52:56 -0300
comments: true
categories: 
 - BASH
 - Linux
---


Adicione o código abaixo em seu script bash:
{% codeblock lang:bash %}
function abort() {
  MESSAGE="$1"
  CURRENT_PID=$$
  if [ "${MESSAGE}X" != "X" ]; then
    echo "${MESSAGE}"
  fi

  kill -9 ${CURRENT_PID}
}
{% endcodeblock %}

Para utilizá-lo, apenas chame-a como outra função qualquer:
{% codeblock lang:bash %}
abort "coloque sua mensagem aqui..."
{% endcodeblock %}