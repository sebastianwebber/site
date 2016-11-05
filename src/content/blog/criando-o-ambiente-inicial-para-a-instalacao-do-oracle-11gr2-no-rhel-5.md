---
author: Sebastian Webber
comments: true
date: 2012-04-21 16:18:57 -0300
slug: criando-o-ambiente-inicial-para-a-instalacao-do-oracle-11gr2-no-rhel-5
title: Criando o ambiente inicial para a instalação do Oracle 11gR2 no RHEL 5
wordpress_id: 206
categories:
- ASM
- Oracle
tags:
- Environment
- Get Started
- Oracle
- ASM
- RHEL
---

Após a instalação do RHEL e os devidos updates, crie os respectivos usuários e grupos:
```bash
groupadd oinstall
groupadd dba
groupadd oper
useradd -g oinstall -G dba,oper oracle
```

Agora, identifique seu kernel:
```bash
# uname -r
2.6.18-308.4.1.el5
```

Baixe, [do site da oracle](http://www.oracle.com/technetwork/server-storage/linux/downloads/rhel5-084877.html), os pacotes necessários:

  * oracleasm-support-2.1.7-1.el5.x86_64.rpm

	
  * oracleasmlib-2.0.4-1.el5.x86_64.rpm

	
  * oracleasm-2.6.18-308.4.1.el5-2.0.5-1.el5.x86_64.rpm




> Estou baixando o pacote do oracleasm de acordo a minha versão do kernel, caso a sua não seja a mesma, baixa a respectiva.


Instale os pacotes no baixados:

```bash
rpm -Uvh oracleasm-support-2.1.7-1.el5.x86_64.rpm
rpm -Uvh oracleasmlib-2.0.4-1.el5.x86_64.rpm
rpm -Uvh oracleasm-2.6.18-308.4.1.el5-2.0.5-1.el5.x86_64.rpm
```

Configure o ASM:

```bash
# /etc/init.d/oracleasm configure
Configuring the Oracle ASM library driver.

This will configure the on-boot properties of the Oracle ASM library
driver.  The following questions will determine whether the driver is
loaded on boot and what permissions it will have.  The current values
will be shown in brackets ('[]').  Hitting  without typing an
answer will keep that current value.  Ctrl-C will abort.

Default user to own the driver interface []: oracle
Default group to own the driver interface []: oinstall
Start Oracle ASM library driver on boot (y/n) [n]: y
Scan for Oracle ASM disks on boot (y/n) [y]: y
Writing Oracle ASM library driver configuration: done
Initializing the Oracle ASMLib driver:                     [  OK  ]
Scanning the system for Oracle ASMLib disks:               [  OK  ]
```


> Nesse ponto, particione os discos de acordo com a necessidade.


No exemplo, a instalação está no disco 1 (sda) e o ASM está nos discos 2 (sdb) e 3 (sdc) e os particionei em 8 partes de 5gb cada um.

```bash
# fdisk -l

Disk /dev/sda: 21.4 GB, 21474836480 bytes
255 heads, 63 sectors/track, 2610 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *           1          13      104391   83  Linux
/dev/sda2              14        2610    20860402+  8e  Linux LVM

Disk /dev/sdb: 42.9 GB, 42949672960 bytes
255 heads, 63 sectors/track, 5221 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes

   Device Boot      Start         End      Blocks   Id  System
/dev/sdb1               1        5221    41937651    5  Extended
/dev/sdb5               1         609     4891729+  83  Linux
/dev/sdb6             610        1218     4891761   83  Linux
/dev/sdb7            1219        1827     4891761   83  Linux
/dev/sdb8            1828        2436     4891761   83  Linux
/dev/sdb9            2437        3045     4891761   83  Linux
/dev/sdb10           3046        3654     4891761   83  Linux
/dev/sdb11           3655        4263     4891761   83  Linux
/dev/sdb12           4264        5221     7695103+  83  Linux

Disk /dev/sdc: 42.9 GB, 42949672960 bytes
255 heads, 63 sectors/track, 5221 cylinders
Units = cylinders of 16065 * 512 = 8225280 bytes

   Device Boot      Start         End      Blocks   Id  System
/dev/sdc1               1        5221    41937651    5  Extended
/dev/sdc5               1         609     4891729+  83  Linux
/dev/sdc6             610        1218     4891761   83  Linux
/dev/sdc7            1219        1827     4891761   83  Linux
/dev/sdc8            1828        2436     4891761   83  Linux
/dev/sdc9            2437        3045     4891761   83  Linux
/dev/sdc10           3046        3654     4891761   83  Linux
/dev/sdc11           3655        4263     4891761   83  Linux
/dev/sdc12           4264        5221     7695103+  83  Linux
```

Agora marque os discos como disponíveis para a ASM:

```bash
# /etc/init.d/oracleasm createdisk ASMDISK01 /dev/sdb5
Marking disk "ASMDISK01" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK02 /dev/sdb6
Marking disk "ASMDISK02" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK03 /dev/sdb7
Marking disk "ASMDISK03" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK04 /dev/sdb8
Marking disk "ASMDISK04" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK05 /dev/sdb9
Marking disk "ASMDISK05" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK06 /dev/sdb10
Marking disk "ASMDISK06" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK07 /dev/sdb11
Marking disk "ASMDISK07" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK08 /dev/sdb12
Marking disk "ASMDISK08" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK09 /dev/sdc5
Marking disk "ASMDISK09" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK10 /dev/sdc6
Marking disk "ASMDISK10" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK11 /dev/sdc7
Marking disk "ASMDISK11" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK12 /dev/sdc8
Marking disk "ASMDISK12" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK13 /dev/sdc9
Marking disk "ASMDISK13" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK14 /dev/sdc10
Marking disk "ASMDISK14" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK15 /dev/sdc11
Marking disk "ASMDISK15" as an ASM disk:                   [  OK  ]
# /etc/init.d/oracleasm createdisk ASMDISK16 /dev/sdc12
Marking disk "ASMDISK16" as an ASM disk:                   [  OK  ]
```

Agora veja a relação discos disponíveis:

```bash
# /etc/init.d/oracleasm listdisks
ASMDISK01
ASMDISK02
ASMDISK03
ASMDISK04
ASMDISK05
ASMDISK06
ASMDISK07
ASMDISK08
ASMDISK09
ASMDISK10
ASMDISK11
ASMDISK12
ASMDISK13
ASMDISK14
ASMDISK15
ASMDISK16
```


> ASMDISKXX é o label que dei para o disco e é como você irá identificar o mesmo na configuração da ASM... Ajuste o nome conforme achar necessário.


Agora instale os pacotes necessários:

```bash
# yum install gcc elfutils-libelf-devel glibc-devel glibc-headers gcc-c++ libaio-devel libstdc++-devel sysstat unixODBC unixODBC-devel
```

> UPDATE: Após o reboot do servidor a ASM não iniciou, logo, deixei a correção [em outro post]({{< relref "apos-reboot-asm-nao-iniciou.md" >}} ).