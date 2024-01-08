---
title: PXE Server on Existing Network (DHCP Proxy) with Ubuntu
date: 2016-09-02T20:47:00+01:00
topics:
- ubuntu
- pxe
draft: true
---

There are a lot of articles out there that explain how to run a [PXE server](wikipedia:Preboot_Execution_Environment). However, I couldn't find a single one that contained *all* the information to setup a PXE server:
* on Ubuntu
* without replacing the network's existing DHCP server (e.g. provided by a hardware router)

So, with article I'm trying to fill this gap.

## The Goal

At the end of this article you'll have a working PXE server that lets you **boot [memtest86+](http://www.memtest.org/) over a network**.

The goal is to have a **simple but working solution**. This is why I'm using memtest. It consists of just one file and thus is easy to use in a PXE setup. More complex scenarios (i.e. loading real operating systems) can be built on top of this simple setup.

Everything described in the article can be done **inside a virtual machine**. The only requirement is that the VM is connected directly (i.e. no NAT) to the network where it's supposed to serve PXE (usually the host's network).

## The Basics: PXE, DHCP, ProxyDHCP, TFTP, and dnsmasq

**PXE** is an abbreviation for "**P**reboot E**x**ecution **E**nvironment". To put it simple: It's a standardized way to boot an operating system over network (rather than from hard disk).

**DHCP** is usually used to assign IP addresses to computers/devices in a network. PXE is an extension to DHCP. To use PXE one needs a PXE-capable DHCP server.

When PXE was designed, the creators wanted to make it compatible with networks that already have an existing DHCP server. As a result, PXE and DHCP can be provided by separate servers without interfering with each other. In this scenario, the PXE server is called **proxyDHCP** server and only provides the PXE functionality (but doesn't do IP assigning).

**TFTP** (Trivial File Transfer Protocol) is used by PXE clients to download the operating system (file) from the PXE server.

**dnsmasq** is a "simple" Linux tool that combines a DNS server, a DHCP server, a TFTP server, and a PXE server. This is the tool you'll use in this article.

## Prerequisites

The steps in this article are based on Ubuntu 16.04.

You need the following packages:

```
$ apt-get install dnsmasq pxelinux syslinux-common
```

You also need the precompiled memtest binary:

```
$ wget http://www.memtest.org/download/5.01/memtest86+-5.01.bin.gz
$ gzip -dk memtest86+-5.01.bin.gz
```

Furthermore, you need a working DHCP server (e.g. one provided by a hard router).

The last thing you need is to know the network you're on. My network is `192.168.178.XXX` - so I'll use this in this article. This information is only needed once in a configuration file (see below).

**Warning:** During the course of this article your Ubuntu machine may temporarily lose the ability to do DNS lookups. This is caused by `dnsmasq`. If this happens to you and you need to download anything or access the web, just (temporarily) stop `dnsmasq`.

## Step by Step: From Start to Finish

Lets do it then. This section describes all steps need to get a working PXE server.

First, lets stop dnsmasq for now.

```
$ service dnsmasq stop
```

Create the directory where all transferable operating system files will reside:

```
$ mkdir -p /var/lib/tftpboot
```

Inside of this directory, create a directory for the unzipped memtest binary file and copy it there:

```
$ mkdir -p /var/lib/tftpboot/memtest
$ cp ~/memtest86+-5.01.bin /var/lib/tftpboot/memtest/memtest86+-5.01
```

**Important:** Note that the copy command removed the `.bin` file extension. This is required.

Now create the directory for the PXE configuration file:

```
$ mkdir -p /var/lib/tftpboot/pxelinux.cfg
```

**Important:** This directory must always be called `pxelinux.cfg`.

Inside of this directory, create a file called `default` and put in the following content:

```
default memtest86
prompt 1
timeout 15

label memtest86
  menu label Memtest86+ 5.01
  kernel /memtest/memtest86+-5.01
```

Next, you need to put the files `pxelinux.0` (Ubuntu package `pxelinux`) and `ldlinux.c32` (Ubuntu package `syslinux-common`) in `/var/lib/tftpboot`. I'll use symlinks for that:

```
$ ln -s /usr/lib/PXELINUX/pxelinux.0 /var/lib/tftpboot/
$ ln -s /usr/lib/syslinux/modules/bios/ldlinux.c32 /var/lib/tftpboot/
```

Now, clear all contents of `/etc/dnsmasq.conf` and replace them with this:

```ini {lineNos=true,hl_lines="9"}
# Disable DNS Server
port=0

# Enable DHCP logging
log-dhcp

# Respond to PXE requests for the specified network;
# run as DHCP proxy
dhcp-range=192.168.178.0,proxy

dhcp-boot=pxelinux.0

# Provide network boot option called "Network Boot".
pxe-service=x86PC,"Network Boot",pxelinux

enable-tftp
tftp-root=/var/lib/tftpboot
```

**Important:** In line 9 you need to put in your network, if you're not on 192.168.178.XXX.

Edit `/etc/default/dnsmasq` and add the following line to the end:

```
DNSMASQ_EXCEPT=lo
```

This line is necessary because you disabled dnsmasq's DNS functionality above (with `port=0`). Without it Ubuntu will still redirect all DNS queries to `dnsmasq` - which doesn't answer them anymore and thus all DNS lookups would be broken. You can check `/etc/resolv.conf` and verify that it contains the correct IP address for your network's DNS server.

Last step - start `dnsmasq` again:

```
$ service dnsmasq start
```

Now, when starting a PXE-enabled machine, it should boot memtest.

![Booting via PXE](pxe-boot.gif)

## Troubleshooting

While I was trying to get a PXE server working, I stumbled across some pitfalls that I like to add here.

### Starting dnsmasq fails because resource limit

When starting `dnsmasq` with:

```
$ service dnsmasq start
```

and you get the error:

> Job for dnsmasq.service failed because a configured resource limit was exceeded.

... then you (accidentally) deleted `/etc/dnsmasq.d/README`.

The `dnsmasq` init script checks the existence of this file and this leads to this obscure error message (filed as [#819856](https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=819856)).

### PXE Boot with VMWare Fusion

VMWare Fusion's GUI is more designed for regular users than developers. If you want to use PXE boot in a VMWare Fusion VM, make sure you select "Bridged Networking" rather than "Share with my Mac" (which is NAT).

![Configure VMWare Fusion for PXE Boot](vmware-network.png)

### PXE Boot with Hyper-V

To be able to PXE boot a Hyper-V VM, you need to **add a *Legacy* Network Adapter** to the VM. By default, only a non-legacy network adapter is added to VMs and it doesn't support PXE boot (for whatever reason).

![Configure Hyper-V for PXE Boot](hyperv-pxe.png)

This is especially confusing since the "BIOS" section always lists "Legacy Network adapter" - even if none has been added to the VM.
