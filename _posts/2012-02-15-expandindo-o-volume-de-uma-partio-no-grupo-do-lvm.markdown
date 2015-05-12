---
author: seba
comments: true
date: 2012-02-15 18:53:16+00:00
layout: post
slug: expandindo-o-volume-de-uma-partio-no-grupo-do-lvm
title: Expandindo o volume de uma partição no Grupo do LVM
wordpress_id: 169
categories:
- Linux
- RHEL
tags:
- Linux
- LVM
- rhel
---

> No exemplo desse post, o servidor foi instalado com um disco de 15gb, porém o disco foi expandido para 60gb.  O disco utilizado é o ‘/dev/xvda’.  É possível que adicionando o disco a operação seja semelhante.

### Crie a partição disponível


{% codeblock lang:bash %}
cfdisk /dev/xvda
{% endcodeblock %}

Crie a nova partição:

{% img /images/wp-content/uploads/2012/02/image.png %}


Select o tipo de partição:

{% img /images/wp-content/uploads/2012/02/image1.png %}

Informe o tamanho da partição:

{% img /images/wp-content/uploads/2012/02/image2.png %}

Altere o tipo:

{% img /images/wp-content/uploads/2012/02/image3.png %}

Selecione o tipo “8E – Linux LVM”:

{% img /images/wp-content/uploads/2012/02/image4.png %}

Grave as partições no disco:

{% img /images/wp-content/uploads/2012/02/image5.png %}

Confirme a gravação das mudanças no disco e saia. Após isso, reinicie a máquina.


### Crie o novo volume


{% codeblock lang:bash %}
[root@server ~]# pvcreate /dev/xvda3
Writing physical volume data to disk "/dev/xvda3"
Physical volume "/dev/xvda3" successfully created
{% endcodeblock %}

### Adicione o novo volume no grupo existente

> '/dev/vg_server' é o nome do volume

{% codeblock lang:bash %}
[root@server ~]# vgextend /dev/vg_server /dev/xvda3
Volume group "vg_server" successfully extended
{% endcodeblock %}


## Redimensione o grupo existente

### Liste o grupo atual


{% codeblock lang:bash %}
[root@server ~]# vgdisplay --units m
--- Volume group ---
VG Name               vg_server
System ID
Format                lvm2
Metadata Areas        2
Metadata Sequence No  4
VG Access             read/write
VG Status             resizable
MAX LV                0
Cur LV                2
Open LV               2
Max PV                0
Cur PV                2
Act PV                2
VG Size               60932.00 MiB
PE Size               4.00 MiB
Total PE              15233
Alloc PE / Size       3714 / 14856.00 MiB
Free  PE / Size       11519 / 46076.00 MiB
VG UUID               PHTPKa-f1vQ-Ge3q-wc2l-uAn6-gcmP-WlE495
{% endcodeblock %}


O campo **'Free PE / Size'** mostra o espaço disponível (**46076.00 MiB** no exemplo).


### Aumente o volume




> '/dev/vg_server/lv_root' é a partição utilizada


{% codeblock lang:bash %}
[root@server ~]# lvextend -l +100%FREE /dev/vg_server/lv_root
Extending logical volume lv_root to 51.50 GiB
Logical volume lv_root successfully resized
{% endcodeblock %}


### Aumente a partição no sistema de arquivos

> '/dev/vg_server/lv_root' é a partição utilizada

{% codeblock lang:bash %}
[root@server ~]# resize2fs /dev/vg_server/lv_root
resize2fs 1.41.12 (17-May-2010)
Filesystem at /dev/vg_server/lv_root is mounted on /; on-line resizing required
old desc_blocks = 1, new_desc_blocks = 4
Performing an on-line resize of /dev/vg_server/lv_root to 13501440 (4k) blocks.
The filesystem on /dev/vg_server/lv_root is now 13501440 blocks long.
{% endcodeblock %}

Fontes:
	
  * [http://www.howtoforge.com/logical-volume-manager-how-can-i-extend-a-volume-group](http://www.howtoforge.com/logical-volume-manager-how-can-i-extend-a-volume-group)