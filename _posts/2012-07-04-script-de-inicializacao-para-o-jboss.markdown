---
author: Sebastian Webber
comments: true
date: 2012-07-04 21:12:19+00:00
layout: post
slug: script-de-inicializacao-para-o-jboss
title: Script de inicialização para o JBoss EAP/AS
wordpress_id: 245
categories:
- JBoss
- Linux
tags:
- Bash
- Java
- jboss
- Linux
- RedHat
- Scripts
- Shell Script
---


**UPDATE 05/10/2012**: Após 30 tentativas de matar o processo, dá um 'kill -9' nele! Antes de iniciar o serviço , apaga os arquivos da pasta tmp e work da instância.



**UPDATE 05/02/2014**: 
 - Move o arquivo console.log para YYYY-DD-MM_console.log após o stop.
 - Antes do stop ou start, é testado se a instância já está rodando. Caso esteja rodando o start é abortado, caso não esteja o stop é abortado, de acordo com cada operação.
 - Ajustado a chamada do metodo de limpeza (do_cleanup). agora chamado no método de startup (do_start).



**UPDATE 06/02/2014**: 
 - caso o diretório de log da instância não exista, o mesmo será criado durante do startup



{% codeblock lang:bash %}
#!/bin/bash
#
# chkconfig: 345 60 40
#
# JBoss Control Script
#
# Developped by:
#     Sebastian Webber - sebastian.webber@lm2.com.br
# Last update:
#     2014-02-06
#
## DEFAULT SETTINGS ###########################################
JBOSS_HOME="/opt/jboss-6.1.0.Final"
JBOSS_INSTANCE="instance-name"
JBOSS_INSTANCE_PARMS=""
SERVICE_USER="jboss"
 
## STOP EDITING HERE ###########################################
. /etc/init.d/functions

function get_pid() {
    java_pid=$(ps u -C java | grep ${JBOSS_INSTANCE} | awk '{print $2}')
    echo ${java_pid}
}

function do_stop() {

    current_pid=$( get_pid )

    if [ "${current_pid}X" = "X" ]; then
        warning ; echo "Instance '${JBOSS_INSTANCE}' is NOT running..."
    else
        max_tries=30
        killed=0
        echo -n -e "Stopping '${JBOSS_INSTANCE}' instance."
        while [ ${killed} -eq 0 ]; do
            java_pid=$( get_pid )
            if [ "${java_pid}X" != "X" ]; then
                if [ "${max_tries}" -ne 0 ]; then
                    kill -15 ${java_pid}
                    max_tries=$((${max_tries} - 1))
                else
                    kill -9 ${java_pid}
                fi
                sleep 1
                echo -n -e "."
            else
                killed=1
            fi
        done
          
        success ; echo "Instance '${JBOSS_INSTANCE}' was stopped...     "
    fi
}
  
function do_start() {

    current_pid=$( get_pid )

    if [ "${current_pid}X" != "X" ]; then
        warning ; echo "Instance '${JBOSS_INSTANCE}' is already running..."
    else

        # call cleanup
        do_cleanup

        console_log_dir="${JBOSS_HOME}/server/${JBOSS_INSTANCE}/log"

        if [ ! -d "${console_log_dir}" ]; then
            mkdir -p ${console_log_dir} 
            chown -R ${SERVICE_USER}:${SERVICE_USER} ${console_log_dir}
        fi

        echo -n -e "Starting '${JBOSS_INSTANCE}' instance..."
        _console_log="${JBOSS_HOME}/server/${JBOSS_INSTANCE}/log/console.log"
        touch ${_console_log}
        chown ${SERVICE_USER}:${SERVICE_USER} ${_console_log}
        _cmd="${JBOSS_HOME}/bin/run.sh -c ${JBOSS_INSTANCE} ${JBOSS_INSTANCE_PARMS} > ${_console_log} 2>&1 &"
        su - ${SERVICE_USER} -c "${_cmd}"
        if [ $? -eq 0 ]; then
            sleep 3 && show_status
        else
            failure ; echo "Instance '${JBOSS_INSTANCE}' fail to start..."    
        fi
    fi
}
  
function show_status() {
    java_pid=$( get_pid )
  
    if [ "${java_pid}X" != "X" ]; then
        success ; echo "Instance '${JBOSS_INSTANCE}' is running in ${java_pid} process..."
    else
        warning ; echo "Instance '${JBOSS_INSTANCE}' is NOT running..."
    fi
}
 
function do_cleanup() {
    # remove tmp dir
    instance_dir="${JBOSS_HOME}/server/${JBOSS_INSTANCE}"

    console_log_dir="${instance_dir}/log"    
    if [ -f "${console_log_dir}/console.log" ]; then
        mv ${console_log_dir}/console.log ${console_log_dir}/$(date -I)_console.log
    fi

    rm -rf ${instance_dir}/tmp/*
    rm -rf ${instance_dir}/work/*
}
  
function show_usage() {
    this_script=$(basename ${0})
    echo "Usage: ${this_script} (start|stop|restart|status|help)"
}
  
case "${1}" in
    start) do_start ;;
    stop) do_stop;;
    restart) do_stop ; do_start ;;
    status) show_status ;;
    *) show_usage ;;
esac
{% endcodeblock %}
