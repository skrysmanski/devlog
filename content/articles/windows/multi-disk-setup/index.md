---
title: Windows Setup, Boot Manager, And Multiple Disks
date: 2013-05-17
topics:
- windows
aliases:
- /2013/05/17/windows-setup-boot-manager-and-multiple-disks/
- /2013/05/windows-setup-boot-manager-and-multiple-disks/
---

Although Windows Setup has evolved since the days of Windows 95, it sometimes is still a real pain in the ass.

Today, I spent the whole morning figuring out why Windows Setup always placed the Windows boot manager on a separate drive - and not on the drive I was installing Windows onto.

The "easiest" solution would be to unplug all other drives, install Windows, and then re-plug all drives. But since I'm a engineer I wanted to find out the real cause of the problem.

Turns out, the root problem is the BIOS' **boot order** (a.k.a. **boot sequence**). A computer's BIOS has a boot order list which basically defines from which device (hard disk, CD drive) to boot. If the BIOS can't boot from the first device, it tries the second one, and so on.

The BIOS usually lets you define this order. Either all devices are in one big list, or each device type (CD drives, hard disks) has its own list.

![Boot Order in BIOS](boot-order.jpg)

Now, when you install Windows, the setup asks the BIOS for this list. And no matter what you do, Windows Setup will **always install the boot manager on the first hard disk** in this boot order list.

In particular, the disk on which you want to install Windows has *no influence* on where the boot manager is being installed.

So, the only way to influence the location of the boot manager is to change to boot order in the BIOS.

```note
New devices are usually added to the end of the boot order list. So if you have multiple hard drives and replace one (e.g. because the old one was broken or too small), the new drive may end up at the *end* of the list - and not at the position where the replaced drive was before; thus messing up the boot order.
```

## Determining the Boot Manager Partition

So, how can one determine the location of where boot manager is installed?

### From Windows Setup

Determining on which drive Windows Setup will install the boot manager onto is almost impossible from Windows Setup itself.

The only *hint* you get, is if:

* your installation disk has no partitions (i.e. is empty) ...
* .. and then you can create a partition on this disk.

In this case Windows Setup will show you a dialog reading:

> To ensure that all Windows features work correctly, Windows might create additional partitions for system  files.

If this happens and you click on "OK", Windows Setup will automatically create a partition called "System Reserved" where it'll install the boot manager.

![Windows Setup asking to create additional partitions](boot-manager-in-windows-setup.jpg)

If this doesn't happen the boot manager may or may not be installed in the correct location. If this is the case, you can only check the location *after* Windows has been installed.

### From Windows

To determine the partition where the boot manager is installed, go to:

  **Control Panel** > **Administrative Tools** > **Computer Management** > **Disk Management**

The partition where the boot manager is installed has the word **System** in its status.

![Boot Manager Partition in Disk Management on Windows](sytem-partition.jpg)
