---
title: Variables in Ansible
description: How to use variables in Ansible playbooks
date: 2025-07-21
topics:
- ansible
---

This article shows a few examples of how to use variables in Ansible.

See also: [Official Documentation on Variables](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html)

## Inline

Variables can be defined inside a playbook in the `vars` section:

```yaml {lineNos=true,hl_lines="4-6 11 15"}
- name: Install K3s servers
  hosts: k3s_servers

  vars:
    download_url: "https://get.k3s.io"
    node_token_path: "/var/lib/rancher/k3s/server/node-token"

  tasks:
    - name: Install k3s server
      shell:
        cmd: "curl -sfL {{ download_url }} | sh -"

    - name: Read K3s node token
      slurp:
        src: "{{ node_token_path }}"
      register: k3s_token_raw
```

Variables are used by wrapping them in curly braces - like `{{ download_url }}`.

> [!NOTE]
> When using variables, the value must always be quoted - or else Ansible may get confused.

## In Separate File {#vars-file}

Variables can also be defined in a separate file:

```yaml
# File name: k3s.vars.yml
download_url: "https://get.k3s.io"
node_token_path: "/var/lib/rancher/k3s/server/node-token"
```

You use them in a playbook with the `vars_files` section:

```yaml {lineNos=true,hl_lines="4-5"}
- name: Install K3s servers
  hosts: k3s_servers

  vars_files:
    - k3s.vars.yml

  tasks:
    - name: Install k3s server
      shell:
        cmd: "curl -sfL {{ download_url }} | sh -"

    - name: Read K3s node token
      slurp:
        src: "{{ node_token_path }}"
      register: k3s_token_raw
```

You can use the variables as if they were defined inline.

> [!TIP]
> If the values are secrets, see [](secrets.md) for more details.

> [!NOTE]
> If you **misspell the name of the vars file** (for example, the file has the `.yml` extension but you list it with the `.yaml` extension in `vars_file`), you'll get an error that the variable isn't defined (i.e. you will *not* get an error that your vars file doesn't exist).
