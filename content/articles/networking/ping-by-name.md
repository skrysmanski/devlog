---
title: Ping/Identify Computers By Name In Local Network
date: 2014-07-07
topics:
- networking
- dns
- mdns
aliases:
- /2014/07/07/pingidentify-computers-by-name-in-local-network/
- /2014/07/pingidentify-computers-by-name-in-local-network/
---

In a local network (or any other network), it's desirable to be able to find computers by *name* rather than by *ip address*.

So, instead of using:

```shell
ping 192.168.178.25
```

one wants to use:

```shell
ping mycomputer
```

This mapping task is typically done by a **DNS server**.

Sometime back I wrote an article about how to ping/identify computers by name on Windows.

However, this solution highly depends on a good router that

* lets you specify names for individual ip addresses (or determines them automatically)
* provides a domain name for your local network (e.g. "fritz.box")

Unfortunately, I recently was forced to switch to a less "superior" router that doesn't support these features. So an alternative had to be found.

## Multicast DNS

Fortunately, a solution exists and this solution is called **Multicast DNS** (short: mDNS).

Multicast DNS lets you find computers on your *local* network by name. You just have to add `.local` to the computer's name.

So, to ping a computer called **marvin** you'd use:

```shell
ping marvin.local
```

## What Do I Need?

There are two major mDNS implementations: Apple's **Bonjour** and Microsoft's **Link-local Multicast Name Resolution (LLMNR)**.

Bonjour seems to have a wider adoption so I'm concentrating on this.

Here's what you need:

* **Windows:** If you have iTunes installed, you're ready to go. If you don't want to install iTunes, you'll need to install the [Bonjour Print Services for Windows](http://support.apple.com/kb/DL999). (Don't be bothered by the "printing" part in the name. The package is a fully functional mDNS solution and it's the only standalone Bonjour package available for Windows anyway.)
* **Linux:** You need *Avahi* which is compatible with Bonjour. On Ubuntu/Debian, you need two packages: **avahi-daemon** (to be visible on the network) and **libnss-mdns** (to be able to find other computers)
* **OS X:** Everything is pre-installed. You don't need anything else.

**Notes:**

* The domain [.local](wikipedia:.local) has officially been reserved for resolving names in a local network. This means that:
  * there will never be a "real" domain ending called ".local". So you don't run the risk of name conflicts with the internet.
  * good routers won't ask your ISP's DNS server for ".local" names. So connecting to a ".local" name, will always result in an ip address from the local network.
* mDNS, of course, only works if no two computers on the local network share the same name.
* With mDNS, you don't need to specify `.local` as "primary DNS suffix" on Windows.
