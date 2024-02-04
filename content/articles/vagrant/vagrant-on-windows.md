---
title: Vagrant on Windows
date: 2021-06-13
topics:
- vagrant
- windows
---

Using Vagrant on Windows is a little bit more complicated. The reason: **Hyper-V**

The main problem with Hyper-V is that other hypervisors (like VirtualBox) no longer work when Hyper-V is enabled.

It's also problematic that it's not really obvious whether Hyper-V is enabled or not. The following pieces of developer software enable/require Hyper-V (as of 2021):

* Docker
* WSL (Windows Subsystem for Linux)

If you want to use any of these, you need to use Vagrant with Hyper-V.

## Installing required software

To be able to use Vagrant with Hyper-V, Vagrant requires the **Hyper-V PowerShell Cmdlets** to be installed. To do so, open an **admin PowerShell console** and execute this command:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-Management-PowerShell -All
```

## Using Vagrant with Hyper-V

The most important thing to know:

> To use Vagrant with Hyper-V, you need to run your `vagrant` commands from an **admin console**.

If you're in doubt whether Vagrant uses Hyper-V, you can simply add `--provider=hyperv` to each command:

```shell
$ vagrant up --provider=hyperv
```

## Vagrant Version

Latest usable version: **2.2.6**

Note: Newer 2.2.x versions (including 2.2.16) contain a bug that makes Vagrant unusable on Windows: <https://github.com/hashicorp/vagrant/issues/12121>

## Temporarily disable and re-enable Hyper-V

If you want to temporarily disable Hyper-V (without uninstalling it), open an **admin prompt** and enter:

```shell
$ bcdedit /set hypervisorlaunchtype off
```

Then restart you machine.

To re-enable Hyper-V afterwards, enter:

```shell
$ bcdedit /set hypervisorlaunchtype auto
```

Again, restart your machine.
