---
author: Sebastian Webber
comments: true
date: 2013-09-10 01:45:34+00:00
layout: post
slug: guia-de-estudo-para-a-prova-ex248
title: Guia de estudo para a prova EX248 - Red Hat Certified JBoss Administrator (RHCJA)
wordpress_id: 372
categories:
- JBoss
- RHCJA
tags:
- EAP 6
- EX248
- JBoss EAP
- Red Hat Certified JBoss Administrator
- RHCJA
---

Mais detalhes podem ser encontrados no site da RedHat[1] e na documentação oficial[2]


## Install and manage JBoss Enterprise Application Platform






* [Install JBoss Enterprise Application Platform to a specific location on a system.](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Installation_Guide/index.html#chap-Installation)


* [Install additional, operating system specific native libraries to enhance ](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#Install_the_mod_cluster_Module_Into_Apache_HTTPD_or_Enterprise_Web_Server_HTTPD1)




## JBoss Enterprise Application Platform performance






* [Configure minimal security requirements for accessing and managing JBoss Enterprise Application Platform](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Security_Guide/index.html#chap-Management_Interface_Security)


* [Access and manage JBoss Enterprise Application Platform using the provided tools](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#chap-Management_Interfaces)


* Configure and start a multi-node, multi-server JBoss Enterprise Application Platform domain spanning at least two hosts with multiple servers per host


* Configure JBoss Enterprise Application Platform domains, hosts and servers


* Create and remove JBoss Enterprise Application Platform domains, hosts and servers


* [Start, monitor and stop individual JBoss Enterprise Application Platform domains, hosts and servers](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#sect-Start_JBoss_EAP_6)


* [Configure Java™ memory usage at the host, server group and server level](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#sect-About_JVM)




## Configure JBoss Enterprise Application Platform to support clustered and HA operation






* [Configure persistent network bindings for JBoss Enterprise Application Platform services (both addresses and ports)](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#chap-Network_and_Port_Configuration)


* [Configure high-availability clustering using either TCP unicast or UDP multicast networking](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#Use_TCP_Communication_for_the_Clustering_Subsystem1)


* Secure the communications channels between clustered nodes


* [Configure an Apache based load balancer for handling HTTP session fail over in a HA environment](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#sect-Web_HTTP_Connectors_and_HTTP_Clustering)




## Monitoring and managing JBoss Enterprise Application Platform






* [Create and restore configuration snap shots](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#Configuration_File_History)
* [Configure JBoss Enterprise Application Platform logging](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#sect-Introduction-3)
* [Configure and secure JBoss Enterprise Application Platform JMX interface for external monitoring](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#Disable_Remote_Access_to_the_JMX_Subsystem1)

## Configuring Java Messaging Service

* [Create and configure JMS topics and queues](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#Configure_the_JMS_Server1)

* Secure access to JMS destinations

## Manage applications

* Select appropriate JBoss Enterprise Application Platform server profiles based on application requirements

** default: os subsistemas mais comuns:_ logging, security, datasources, infinispan, weld, webservices,ee e ejb3_
** ha: _default_ + jgroups + modcluster
** full: _default_ + messaging (HornetQ) + cmp + jacord + jaxr
** full-ha: _full_ + jgroups + modcluster

* [Configure DataSources (both XA and non-XA compliant)](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#chap-Datasource_Management)
* [Deploy and undeploy applications](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#chap-Application_Deployment)
* [Deploy and undeploy additional libraries and drivers](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#chap-Configuring_Modules)
* [Deploy a web application to the root context](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#Replace_the_Default_Welcome_Web_Application1)

## Configure JBoss Web Connectors

* Tune and configure JBoss Enterprise Application Platform web connector properties as requested
* [Configure Apache integration with JBoss Enterprise Application Platform](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#sect-HTTPD_Configuration)
* [Configure an SSL encrypted connection](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#sect-SSL_Encryption)

## Configure JBoss Enterprise Application Platform security

* [Create, modify and use security domains](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#Use_a_Security_Domain_in_Your_Application)
* [Connect JBoss Enterprise Application Platform to specified external security sources such as LDAP and DBMS](https://access.redhat.com/site/documentation/en-US/JBoss_Enterprise_Application_Platform/6.1/html-single/Administration_and_Configuration_Guide/index.html#Use_LDAP_to_Authenticate_to_the_Management_Interfaces1)
* Secure access to JBoss Enterprise Application Platform services


Referências:

1. https://www.redhat.com/training/courses/ex248/
2. https://access.redhat.com/site/documentation/JBoss_Enterprise_Application_Platform/


