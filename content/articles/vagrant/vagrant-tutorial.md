---
title: Vagrant Tutorial - From Nothing To Multi-Machine
date: 2016-09-29T20:55:00+01:00
topics:
- vagrant
---

As developers, we sometimes want to quickly test some software. Instead of installing it directly on our developer machine, it's better to install it in a virtual machine (VM). But if you don't have a VM ready, setting one up usally takes a lot of time - and there goes your productivity.

Fortunately, there is a solution: [[https://www.vagrantup.com|Vagrant]]

Vagrant is a free tool that lets you quickly spin-up fresh VMs out of thin air. It can even spin-up multiple VMs at the same time.

This article is step by step tutorial for getting from nothing to a multi-VM setup where the VMs can talk to each other.

<!--more-->

[[[TOC]]]

== The Goal ==
At the end of this tutorial, we'll have 3 virtual machines, one called "master" and two nodes, that can find each other via their hostnames. Except for Vagrant, no external software is required to achieve this.

The setup we'll be creating is just a foundation you can expand on. It won't do anything meaningful. It's just to get you the infrastructure to do something meaningful.

If you're just interested in the end result, skip ahead to [[#endresult]].

== Notes Before We Start ==
To be able to follow this tutorial, it's helpful if you have a //basic// understanding of the following:

* How to interact with the **command line** of your operating system - since Vagrant is controlled from the command line.
* What SSH is for.
* What virtual machines are in general.

For Vagrant I recommend that you have a **fast internet connection**. The VMs created by Vagrant are downloaded from the internet and are usually 600 MB or bigger. A slow internet connection will work but you'll have to wait for a long time for the downloads to finish.

As for software versions, this tutorial was tested against **Vagrant 1.8.5 and VirtualBox 5.1**.

== Installation ==
To be able to use Vagrant you need two things: **Vagrant itself and a hyper-visor.**

On Windows you may also want to install a [[3837|command line replacement]].

You can download Vagrant here:

  https://www.vagrantup.com/downloads.html

As **hyper-visor**, you can choose between VirtualBox, VMWare (Fusion), and Hyper-V.

The easiest option is **[[https://www.virtualbox.org/|VirtualBox]]**. It's free and available on every platform.

If you have **Hyper-V** installed, don't install VirtualBox. Hyper-V is incompatible with other hyper-visors. (See [[https://www.vagrantup.com/docs/hyperv/|here]] for more information.)

If you have **VMWare Fusion** installed on your Mac, please note that the VMWare provider for Vagrant [[https://www.vagrantup.com/vmware/#buy-now|costs money]] - even if you already have a VMWare Fusion license. If you don't want to spend money, just use VirtualBox. It can be installed alongside VMWare Fusion.

To verify that Vagrant is installed, type on the command line:

{{{
> vagrant -v
Vagrant 1.8.5
}}}

== Starting and Interacting with Your First VM ==
To start your first VM, first **create an empty directory** somewhere and ##cd## into it.

Then execute the following two commands:

{{{
> vagrant init hashicorp/precise64
> vagrant up
}}}

This will start a virtual machine running Ubuntu 12.04 (Precise Pangolin).

**Note:** If you're using Hyper-V instead of VirtualBox, you have to call ##vagrant up --provider=hyperv## instead of just ##vagrant up##. Alternatively, you may want to configure Hyper-V as the default provider for Vagrant. See [[https://www.vagrantup.com/docs/providers/basic_usage.html|this article]] on how to do this.

To ssh into the VM, call:

{{{
> vagrant ssh
}}}

To get out of the VM, hit ##Ctrl + D##.

To stop and delete the whole VM, call:

{{{
> vagrant destroy -f
}}}

This will delete the VM and all of its resources (i.e. the virtual hard drive) from your computer.

== The Vagrantfile ==
When you called ##vagrant init hashicorp/precise64## earlier, Vagrant created a file called ##Vagrantfile## in the current directory.

This file is everything Vagrant needs to do its work.

The file created by ##vagrant init## contains lots of documentation and is a good starting point for customizing the VM.

However, for the purpose of this tutorial, let's reduce the file to its bare minimum:

{{{ lang=ruby
Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/precise64"
end
}}}

In the second line you can see the value you passed to ##vagrant init## earlier: ##hashicorp/precise64##

This is the name of the base image (think: virtual hard disk) used for the VM to create. Such an image is called a **box** in Vagrant terminology.

When Vagrant creates a VM from a box (base image), it actually creates a **copy** of this image. Thus, any changes done inside of the VM are lost when the VM is destroyed (via ##vagrant destroy##). A VM can't modify its base image.

== Choosing the Right Box (Base Image) ==
Vagrant boxes are downloaded by default from HashiCorp's Atlas system. All available boxes can be searched here:

  https://atlas.hashicorp.com/boxes/search

For a single, specific operating system there are usually many boxes to choose from. For example, searching for a **Ubuntu 14.04** box returns (among others):

* ubuntu/trusty64
* puphpet/ubuntu1404-x64
* boxcutter/ubuntu1404
* bento/ubuntu-14.04

Unfortunately, boxes on Atlas differ in quality since anyone can upload a box. A low quality box prevents you from using Vagrant features, such as setting the hostname of VM or creating a private network.

During my testing I found that the ##ubuntu/...## boxes have very low quality (which is surprising given that they're are created by Canonical, the company behind Ubuntu).

Also, HashiCorp (the company behind Vagrant) only provides boxes for Ubuntu 12.04. So they can't be selected as source of high quality boxes either. (During my testing, even the ##hashicorp/precise64## box had its problems.)

The [[https://www.vagrantup.com/docs/boxes.html#official-boxes|Vagrant documentation about official boxes]] recommends to use the boxes from the ##bento## namespace (apparently created by the team at [[https://www.chef.io/|Chef]]).

During my (limited) tests they worked flawlessly and so they're my recommendation, too. We'll use them for rest of the tutorial. You can find them here:

  https://atlas.hashicorp.com/bento

**Note:** Unfortunately, the bento boxes don't work with Hyper-V. So if you're using Hyper-V with Vagrant, you have to find a different box.

== Updating a VM after Vagrantfile Has Changed ==
Modifying a ##Vagrantfile## while its VM is running has no effect on the running VM.

To "synchronize" the VM with its ##Vagrantfile##, you can either:

# call ##vagrant reload## or
# call ##vagrant destroy -f## followed by ##vagrant up##

**Note:** If you're using provisioning (see below) and changed the provisioning data, you need to call ##vagrant reload --provision## in the first case.

To make things simpler, I recommend you're using **the second option for this tutorial**.

== Multi-Machine: The Naive Way ==
So far we've always started a single VM.

We can also start multiple VMs with a single ##Vagrantfile##. This is called **Multi-Machine**.

The easiest (or most naive) way to create a multi-machine is with a ##Vagrantfile## like this:

{{{lang=ruby
Vagrant.configure("2") do |config|
  config.vm.define "master" do |subconfig|
    subconfig.vm.box = "bento/ubuntu-16.04"
  end

  config.vm.define "node1" do |subconfig|
    subconfig.vm.box = "bento/ubuntu-16.04"
  end

  config.vm.define "node2" do |subconfig|
    subconfig.vm.box = "bento/ubuntu-16.04"
  end
end
}}}

This will create 3 VMs (master, node1, node2).

To ssh into any of the VMs, just specify its name. For example, to ssh into ##node1##, call:

{{{
> vagrant ssh node1
}}}

To destroy all VMs, just call:

{{{
> vagrant destroy -f
}}}

This is exactly the same command as for a single VM.

== Multi-Machine: The Clever Way ==
The previous multi-machine ##Vagrantfile## had lots of copied code.

The same setup can also be described in a more "programmer-like" manner:

{{{ lang=ruby
BOX_IMAGE = "bento/ubuntu-16.04"
NODE_COUNT = 2

Vagrant.configure("2") do |config|
  config.vm.define "master" do |subconfig|
    subconfig.vm.box = BOX_IMAGE
  end

  (1..NODE_COUNT).each do |i|
    config.vm.define "node#{i}" do |subconfig|
      subconfig.vm.box = BOX_IMAGE
    end
  end
end
}}}

Here we:
* Moved the box name into a constant (##BOX_IMAGE##).
* Converted the "nodeX" definitions into a for each loop where ##NODE_COUNT## describes the number of nodes to create.

== Connecting the VMs via Network ==
The setup in the previous section created 3 VMs. However, up until now these VMs had no way of communicating with each other.

**Important:** Before you do this section, please call ##vagrant destory -f##. This makes things easier.

To fix this we need three things.

First, each VM needs a unique hostname. By default, each of the VMs has the same hostname (##vagrant##). To change this, we need to add a configuration like the following to each VM definition in the ##Vagrantfile##:

{{{ lang=ruby
subconfig.vm.hostname = "a.host.name"
}}}

Next, we need a way of getting the IP address for a hostname. For this, we'll use DNS - or mDNS to be more precise.

On Ubuntu, mDNS is provided by Avahi. To install Avahi on each node, we'll use Vagrant's [[https://www.vagrantup.com/docs/provisioning/|provisioning feature]].

Before the last ##end## in the ##Vagrantfile##, we'll add this code block:

{{{ lang=ruby
config.vm.provision "shell", inline: <<-SHELL
  apt-get install -y avahi-daemon libnss-mdns
SHELL
}}}

This will call ##apt-get install -y avahi-daemon libnss-mdns## on every VM.

**Note:** By default, provisioning is only done the first ##vagrant up##. See [[https://www.vagrantup.com/docs/provisioning/|here]] for more details.

Last, we need to connect the VMs through a [[https://www.vagrantup.com/docs/networking/private_network.html|private network]].

For each VM, we need to add a config like this (where each VM will have a different ip address):

{{{ lang=ruby
subconfig.vm.network :private_network, ip: "10.0.0.10"
}}}

== Putting everything together == #endresult
Putting everything mentioned in the previous section together results in a ##Vagrantfile## like this:

{{{ lang=ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :

# Every Vagrant development environment requires a box. You can search for
# boxes at https://atlas.hashicorp.com/search.
BOX_IMAGE = "bento/ubuntu-16.04"
NODE_COUNT = 2

Vagrant.configure("2") do |config|
  config.vm.define "master" do |subconfig|
    subconfig.vm.box = BOX_IMAGE
    subconfig.vm.hostname = "master"
    subconfig.vm.network :private_network, ip: "10.0.0.10"
  end

  (1..NODE_COUNT).each do |i|
    config.vm.define "node#{i}" do |subconfig|
      subconfig.vm.box = BOX_IMAGE
      subconfig.vm.hostname = "node#{i}"
      subconfig.vm.network :private_network, ip: "10.0.0.#{i + 10}"
    end
  end

  # Install avahi on all machines
  config.vm.provision "shell", inline: <<-SHELL
    apt-get install -y avahi-daemon libnss-mdns
  SHELL
end
}}}

You can now call ##vagrant up## and then ssh into any of the VMs:

{{{
> vagrant ssh node1
}}}

From there you can ping any other VM by using their hostname (plus ##.local## at the end):

{{{
> ping node2.local
}}}

== Wrap Up ==
As you've seen, it just takes a ##Vagrantfile## with 22 lines and a call to ##vagrant up## to create multiple VMs in one step. Easy, isn't it?

To continue from here, have a look at these resources:

* https://www.vagrantup.com/docs/
* https://www.vagrantup.com/docs/vagrantfile/
* https://www.vagrantup.com/docs/multi-machine/

You can also leave a comment below.

== Changelog ==
* **2016-10-02**
** Added note about bento box not being available for Hyper-V
** Found mention of the Bento boxes in the official Vagrant documentation; changed links to there
* **2016-10-01**
** Added link to command line replacements on Windows
** Added ##NODE_COUNT## to ##Vagrantfile##
* **2016-09-29**
** Initial release
