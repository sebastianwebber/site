---
title: "Instalação do Oracle JDK 6 no EL6"
date: 2014-05-05 09:49:11 -0300
comments: true
categories: 
 - RHEL
 - Java
---

Faça o download da versão legada na URL abaixo:

 - http://www.oracle.com/technetwork/java/javasebusiness/downloads/java-archive-downloads-javase6-419409.html#jdk-6u45-oth-JPR

Faça a instalação do mesmo:
```bash
bash jdk-6u45-linux-x64-rpm.bin
```

Configure o alternatives:

```bash
alternatives --install /usr/bin/java java /usr/java/jdk1.6.0_45/bin/java 20000
alternatives --install /usr/bin/javac javac /usr/java/jdk1.6.0_45/bin/javac 20000
alternatives --install /usr/bin/jar jar /usr/java/jdk1.6.0_45/bin/jar 20000
```

> o número `20000` deve ser o valor que o de outras possíveis instalações (confira com o resultado do comando `alternatives --display java`)

```bash
root@servidor [~]# alternatives --display java
java - status is auto.
 link currently points to /usr/java/jdk1.6.0_45/bin/java
/usr/java/jdk1.6.0_45/bin/java - priority 20000
Current `best' version is /usr/java/jdk1.6.0_45/bin/java.
```