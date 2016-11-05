---
author: Sebastian Webber
comments: true
date: 2012-04-28 15:12:19 -0300
slug: apos-reboot-asm-nao-iniciou
title: Após reboot o ASM não iniciou (ORA-27154, ORA-27300, ORA-27301 e ORA-27302)
wordpress_id: 218
categories:
- ASM
- Oracle
tags:
- ASM
- Erros Oracle
- Linux
- Oracle
- Oracle ASM
---

Após reboot, a ASM não iniciou. Ao tentar iniciar manualmente, ocorre o erro abaixo:

```bash
$ sqlplus / as sysasm

SQL*Plus: Release 11.2.0.1.0 Production on Sat Apr 28 11:30:13 2012

Copyright (c) 1982, 2009, Oracle.  All rights reserved.

Connected to an idle instance.

SQL> startup
ORA-27154: post/wait create failed
ORA-27300: OS system dependent operation:semget failed with status: 28
ORA-27301: OS failure message: No space left on device
ORA-27302: failure occurred at: sskgpsemsper
```

Após analizar os "ORA-", descobri que o parametro kernel.sem estava com o valor padrão, dessa forma, altere-o:

```bash
vim /etc/sysctl
```

Alter o valor de:

```bash
...
kernel.sem = 250  100
...
```

Para:

```bash
...
kernel.sem = 250 32000 100 256
...
```

Após alterar o arquivo, aplique as alterações:

```bash
sysctl -p
```

Agora inicie a ASM novamente (não é necessário reiniciar).

Referencias:

- http://blog.ronnyegner-consulting.de/2011/04/11/ora-27154-postwait-create-failed-ora-27301-os-failure-message-no-space-left-on-device-when-starting-asm-or-database-instance/