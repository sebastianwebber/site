---
title: "Convertendo maquinas virtuais do VMWare Fusion para o VMware ESXI 5.X"
date: 2014-10-22 22:13:48 -0200
comments: true
categories: 
 - VMWare
 - Linux

tags:
 - VMWare Fusion
 - Conversion
 - Virtual Machine
 - Tips
---

Para converter os arquivos do VMWare Fusion, é necessário utilizar o utilitário [ovftool](https://www.vmware.com/support/developer/ovf/).

Para migrar a vm, utilize o comando abaixo:

```bash
/Applications/VMware\ OVF\ Tool/ovftool -ds=datastore1 --network='VM Network' --lax -n=nomevm /caminho/para/a/vm/nomevm.vmwarevm/nomevm.vmx "vi://[[user][:supersenhado]]@ip_do_servidor"
```

> **IMPORTANTE:** lembre de substituir o nome do datastore e a rede para os nomes corretos configurados na sua infra estrutura. Caso queira, também informe o usuário e senha do servidor.




## Troubleshooting
    
### Unsupported hardware family 'vmx-10'

```bash
Opening VI target: vi://root@ip_do_servidor:443/
Error: OVF Package is not supported by target:
 - Line 25: Unsupported hardware family 'vmx-10'.
Completed with errors
```

Edite as propriedades da vm, vá em Compatibility, abra _Advanced Options_ e mude a opção **Use Hardware Version** para **8**.


### No support for the virtual hardware device type '20'

```bash
Opening VI target: vi://root@ip_do_servidor:443/
Error: OVF Package is not supported by target:
 - Line 49: OVF hardware element 'ResourceType' with instance ID '3': No support for the virtual hardware device type '20'.
Completed with errors
```

Edite as propriedades da vm, vá em Compatibility, abra _Advanced Options_ e mude a opção **Use Hardware Version** para **7**.

### Referencias
- https://wikis.uit.tufts.edu/confluence/display/exchange2010/Convert+VMware+Fusion+VM+to+ESXi+VM
- http://www.virtuallyghetto.com/2012/05/how-to-deploy-ovfova-in-esxi-shell.html
- http://theitcrownd.blogspot.com.br/2011/02/importing-virtual-appliances.html
- http://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2012352
