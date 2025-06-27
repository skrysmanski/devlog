---
title: Services - Kubernetes Resources
description: Overview over Services in Kubernetes
date: 2025-07-24
topics:
- kubernetes
---

The resource type **Service** is a [built-in resource type](overview.md) in Kubernetes. It's purpose is to route network traffic to Pods.

Services work on **layer 4** of the [network stack](https://en.wikipedia.org/wiki/OSI_model) - i.e. at the TCP/UDP level. The [Ingress](ingress.md) resource, on the other hand, works on **layer 7** - specifically with HTTP(S).

There are four Service types:

* [ClusterIP](service-clusterip.md) - load balanced IP address, only reachable from within the cluster.
* [NodePort](service-nodeport.md) - exposes the service on each Node at a static port.
* [LoadBalancer](service-loadbalancer.md) - integrates with cloud providers to provision external load balancers.
* [ExternalName](https://kubernetes.io/docs/concepts/services-networking/service/#externalname) - maps the service to a DNS name (less commonly used)

This list is hardcoded into Kubernetes and can't be extended by plugins.

**Official Documentation:** <https://kubernetes.io/docs/concepts/services-networking/service/>
