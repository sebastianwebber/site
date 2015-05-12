---
author: Sebastian Webber
comments: false
date: 2013-01-21 11:53:13+00:00
layout: post
slug: snippet-para-testar-se-o-script-bash-ja-esta-rodando
title: Snippet para testar se o script bash já está rodando
wordpress_id: 311
categories:
- BASH
- Linux
tags:
- Bash
- Linux
- Rapidinhas
- shell
- Shell Script
---

Adicione o código abaixo em seu script bash:
{% codeblock lang:bash %}
function is_running() {
  APP_NAME="$(basename $1)"
  MESSAGE="$2"
  CURRENT_PID=$$
  instances=$( ps --no-headers -C ${APP_NAME} )
  out=$( echo "${instances}" | wc -l)

  if [ $out -gt 1 ]; then
		if [ "${MESSAGE}X" != "X" ]; then
			echo "${MESSAGE}"
		fi
		exit 2
  fi
}
{% endcodeblock %}

Para utilizá-lo, apenas coloque sua mensagem logo abaixo:
{% codeblock lang:bash %}
mensagem="coloque sua mensagem aqui..."
p=$(is_running "$0" "${mensagem}") ; out=$? ; [[ ${out} -ne 0 ]] && echo "${p}" && exit ${out} 
{% endcodeblock %}
