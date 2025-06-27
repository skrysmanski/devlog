---
title: kubectl
description: Overview over kubectl
date: 2025-06-27
topics:
- kubernetes
---

`kubectl` is the primary command line interface to interact (i.e. create [resources](resources/overview.md), view logs, ...) with a Kubernetes cluster.

Base format:

```sh
kubectl <command> <type> -n <namespace> -o <format>
```

`<type>` is a [resource type](resources/overview.md) and can specified in either:

* singular form (`kubectl get namespace`)
* plural form (`kubectl get namespaces`)
* [abbreviated form](https://kubernetes.io/docs/reference/kubectl/#resource-types) (`kubectl get ns`)

If `-n <namespace>` isn't specified, the [current namespace](resources/namespaces.md) is used.

With `-o` you can specify if you want the output as JSON or YAML.

Examples:

```sh
kubectl get nodes
kubectl get pods
kubectl apply -f <file>
```

> [!TIP]
> Many people create an `alias k=kubectl` for their machine so that they can say `k get pods` instead of `kubectl get pods`.

## Links

* [Official documentation](https://kubernetes.io/docs/reference/kubectl/)
* [Installing kubectl](https://kubernetes.io/docs/tasks/tools/)
