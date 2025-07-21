---
title: Secrets in Ansible
description: How to safely store secrets in Ansible
date: 2025-07-21
topics:
- ansible
- security
---

Ansible provides a built-in way to store secrets in an encrypted form: `ansible-vault`

This way the secrets can be safely checked-in into Git.

See also: [Official Documentation](https://docs.ansible.com/ansible/latest/cli/ansible-vault.html)

## Creating an encrypted YAML file

To create an encrypted YAML file, call:

```sh
ansible-vault create secrets.yaml
```

This will prompt you for a password with which the values are encrypted.

> [!WARNING]
> The safety of your secrets depends on the password you use. So, choose a strong password.

After that, the YAML file will be opened in the default terminal editor that let's you edit the unencrypted YAML file.

The structure of this file is that of a regular [vars file](variables.md#vars-file).

Once you close the editor, the YAML file will be encrypted with the password you've provided.

> [!TIP]
> Make sure you can work with the default editor. Especially `vim` tends to be quite confusing for beginners. I'd recommend switching to `nano` by updating the `EDITOR` environment variable.

The encrypted YAML file will look something like this:

```
$ANSIBLE_VAULT;1.1;AES256
30323431356466633932623631333737333636666632376664366536643135373763313337626365
6466336239383634333139623233346430393434333032340a656136643832356631643366663664
36383665316636636534666230633432383962323335353336326135626564343964346566663163
3766363965643861610a333166353939653938623635366466633733393964353663346263363032
38376637616463663361626537356463643066393234643634356339653838303634
```

## Editing an encrypted YAML file

To edit an encrypted YAML file, call:

```sh
ansible-vault edit secrets.yaml
```

## Using secrets from an encrypted YAML file

You use an encrypted vars file like a [regular vars file](variables.md#vars-file).

For example, assume you have created a `secrets.yml` with ansible-vault with this content:

```yml
db_password: "SuperSecretP@ssw0rd"
```

You can then use this file with `vars_files`:

```yml {lineNos=true,hl_lines="5-6 12"}
#! /usr/bin/env -S ansible-playbook --ask-vault-pass
- name: Create PostgreSQL user
  hosts: db_servers

  vars_files:
    - secrets.yml

  tasks:
    - name: Create PostgreSQL user
      postgresql_user:
        name: myapp_user
        password: "{{ db_password }}"
        state: present
```

Now, when you run this playbook **you must specify the `--ask-vault-pass` parameter**:

```sh
ansible-playbook postgres_user.yml --ask-vault-pass
```

If you forgot to specify `--ask-vault-pass`, you'll get the error "Attempting to decrypt but no vault secrets found".
