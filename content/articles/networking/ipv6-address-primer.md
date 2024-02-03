---
title: IPv6 Address Primer
date: 2018-01-01
topics:
- ipv6
- networking
aliases:
- /2018/01/01/ipv6-address-primer/
- /2018/01/ipv6-address-primer/
---

Almost all developers know that IPv6 solves the problem that we're running out of (IPv4) IP addresses - by having "longer" IP addresses. But that's only a part of what IPv6 addresses really mean. So, in this article I'm going to shed some light onto these other parts.

## Notation

IPv6 addresses consist of **128 bits** (whereas IPv4 addresses are only 32 bits long).

These 128 bits are written in hexadecimal notation as 8 blocks with 16 bits each. Blocks are separated by `:`.

    2001:0db8:0000:0000:0000:0000:0000:0001

This is the full notation of an IPv6 address. However, to make the addresses (potentially) easier to read or write for humans, [RFC 4291](rfc:4291) allows for some abbreviations.

First, one can omit all leading zeros.

    2001:db8:0:0:0:0:0:1

Furthermore, consecutive blocks of zeros can be abbreviated **at most once** with `::`.

    2001:db8::1

Note that `::` can be the start of an address. For example, the address for `localhost` is `::1`.

### Uniform Notation for Humans

Unfortunately, the rules for writing IPv6 addresses as defined in RFC 4291 (see above) are not ideal for human consumption - as none of the two rules are required. Fortunately, there is also [RFC 5952](rfc:5952#section-4) which contains rules to make the textual representation of IPv6 addresses consistent and "easier" for humans to read and write.

The rules are as follows:

1. **Leading zeros** must be omitted. \
   :x: `2001:0db8::001` \
   :white_check_mark: `2001:db8::1`
1. The `::` must be **as short as possible**. \
   :x: `2001:db8:0:0:0:0:0:1` → `2001:db8::0:1` \
   :white_check_mark: `2001:db8:0:0:0:0:0:1` → `2001:db8::1`
1. The `::` must not be used to shorten just **one zero block**. \
   :x: `2001:db8:0:1:1:1:1:1` → `2001:db8::1:1:1:1:1` \
   :white_check_mark: `2001:db8:0:1:1:1:1:1` → `2001:db8:0:1:1:1:1:1`
1. If there are multiple abbreviations possible with `::` (all with the same length), then the **left-most** one must be used. \
   :x: `2001:db8:0:0:1:0:0:1` → `2001:db8:0:0:1::1` \
   :white_check_mark: `2001:db8:0:0:1:0:0:1` → `2001:db8::1:0:0:1`
1. All letters must be **lower-case**. \
   :x: `2001:DB8::1` \
   :white_check_mark: `2001:db8::1`
1. If a **port number** is attached to the address, the address must be enclosed in angular brackets. \
   :x: `2001:db8::1:80` \
   :white_check_mark: `[2001:db8::1]:80`

## Special addresses

There are two special addresses in IPv6:

1. `::1` is the loopback address (equivalent to `127.0.0.1` in IPv4). However, unlike in IPv4, there's *only one* loopback address (whereas in IPv4 you have many - i.e. `127.0.0.1` to `127.255.255.254`).
1. `::` is the unspecified address (i.e. all blocks are zero). This address must only be used under certain circumstance - mainly before a network adapter has gotten an IPv6 address.

## Subnet Prefixes and Interface IDs

A **subnet prefix** (or just **prefix**) defines the size of a subnet in IPv6 (like in IPv4). Its length in bits is appended to an address with a `/`.

    2001:0db8:0000:0000:0000:0000:0000:0001/48

In this example, the prefix length is 48 bits (the first 3 blocks). This means that the subnet "size" is 80 bits (`128 - 48`).

As for the terminology, RFC 4291 calls the two parts of an IPv6 address **subnet prefix** and **interface ID**. For the address from the previous example, this means:

| Subnet Prefix    | Interface ID               |
| ---------------- | -------------------------- |
| 48 bits          | 80 bits                    |
| `2001:0db8:0000` | `0000:0000:0000:0000:0001` |

The **interface ID** uniquely identifies a network adapter (NIC) within its subnet.

IPv6 requires that a subnet is at least 64 bits big (or that a prefix is at most 64 bits long). Exceptions can be made but then some IPv6 features (like [SLAAC](#slaac)) may no longer work properly.

The prefix length for globally routable addresses (see next section) is controlled/specified by the ISP. Unfortunately, it's not uncommon that an ISP gives just a 64 bits prefix - meaning that you can have **just one subnet**.

An exception to this minimum network size rule is the loopback address. The prefix of the loopback address is 128, meaning the "subnet" consists only of one address.

    ::1/128

## Scopes

Each IPv6 address has a scope. The scope says where the address is valid.

The most important scopes are:

| Scope      | Prefix Length  | Description
| ---------- | -------------- | -----------
| Host       | 128            | Only valid on the host; used by `::1`
| Link-local | 64             | Only valid on the link (i.e. up to the next router)
| Global     | 64 ([source](https://datatracker.ietf.org/doc/html/rfc4291#section-2.5.4)) | Valid globally

One important note on the **global** scope: In IPv4 you usually had one public IPv4 address (provided by your ISP) and the IP addresses of each device on a local network were "hidden" behind a NAT. To make a device reachable from the internet, you had to create a port forwarding. With IPv6, if a device has an address with scope *global*, this device is reachable from the internet under this address (unless the router has a firewall to prevent this - which it should have).

## Automatic Address Configuration

With IPv4 you need a DHCP server to automatically assign IP addresses to devices (unless they have been configured with static IP addresses, of course).

With IPv6 this is no longer necessary (although it's still possible).

As described before, an IPv6 address consists of a **subnet prefix** and an **interface id**. So you need to know both to construct an IPv6 address.

For **link-local** addresses, the *subnet prefix* is always the same: `fe80::/64` (some documents say `fe80::/10` but the prefix length is [effectively 64 bits](https://tools.ietf.org/html/rfc4291#section-2.5.6)).

So, an IPv6 device only needs to generate its *interface id*. The interface id is usually based on the network adapter's MAC address and is usually formed by a process called "Modified EUI-64" (see [RFC 2464](rfc:2464#section-4) for more details).

For **global** addresses, SLAAC is used (see below).

To make sure that the generated IP address is really unique (both for global and for link-local addresses), an IPv6 device will "ask" the network whether this address is already taken (via DAD - Duplicate Address Detection) before actually using it.

## SLAAC

To automatically generate an IPv6 address, a device needs to know the **subnet prefix** of the subnet for which it wants to generate the IP address. While the prefix for link-local addresses is fixed, it is not fixed for global addresses.

To figure out the subnet prefix for a global address, an IPv6 device uses **SLAAC** (**S**tate**l**ess **A**ddress **A**uto**c**onfiguration).

Simply put, through SLAAC an IPv6 device can automatically determine the router of a link and ask the router for the global subnet prefix.

The **interface id** can then be generated the same way as for link-local addresses. Nowadays, however, the privacy extensions will be used instead.

### Privacy Extensions

As mentioned above, the **interface id** of a link-local as well as a global IPv6 address is calculated from the network adapter's MAC address.

When opening a network connection (e.g. browsing a website), the server knows the IP address of the caller. This in combination with the "interface id from MAC address" has mainly two privacy concerns:

* Since the MAC address of a network adapter never changes, the interface id won't change - even if the global prefix changes. This allows the server to uniquely identify a device forever.
* A MAC address contains information about the network adapter's vendor. Since the MAC address can be extracted from the interface id, this may divulge unwanted information to the server.

To counteract this, operating systems may use truly random interface ids. Furthermore, operating systems may change the interface ids every now and then (e.g. every 24 hours).

Microsoft Windows goes even one step further and uses privacy extensions even on link-local addresses.

## Percent Notation for Link-Local Addresses

Trying to reach a device by its **link-local** address may fail (unexpectedly):

    $ ping6 fe80::b4:f9f6:e5e9:727e
    connect: Invalid argument

This happens if the current device has **more than one network adapter**.

If a device has multiple network adapters, it is (usually) connected to multiple different links. While unlikely, it's certainly possible that different devices on different links have the same link-local address.

If a device has, say, the network adapters `eth0` and `eth1` and you want to send a ping to `fe80::b4:f9f6:e5e9:727e`, the operating system can't determine over which network adapter to send the ping (because a link-local address must only be unique within its link, not globally).

To solve this problem, you need to attach the network adapter to the address - separated by a `%`.

    $ ping6 fe80::b4:f9f6:e5e9:727e%eth0

## Unicast, Anycast, Multicast

IPv6 addresses can either be a unicast, anycast, or multicast address.

| Type      | Receivers | Description
| --------- | --------- | -----------
| Unicast   | one       | Identifies a single network adapter; most IP addresses are of this type (and if you generally talk about an IP address, you mean a unicast IP address)
| Anycast   | one       | Multiple devices share the same IP address; a network packet is routed to the "nearest" device; for a sender it's indistinguishable from a unicast addresses
| Multicast | many      | Multiple devices share the same IP address (actually, they register themselves on this IP address which is called a *multicast group*); each device receives the packet

A **multicast** group has the additional benefit that the traffic for the sender is the same no matter how many receivers there are. This is useful, for example, for video streaming where all receivers get the same high-volume content.

## Well-known Address Prefixes

There's a number of well-known (read: predefined) address prefixes (or subnet prefixes) from which you can determine an address type:

| Address starts with | Description
| ------------------- | -----------
| `fe80`              | Link-local addresses
| `2`                 | Global unicast addresses
| `ff`                | Multicast groups
