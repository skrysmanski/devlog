---
title: "Kubernetes Resource: Namespaces"
description: Overview over Kubernetes namespaces
date: 2025-06-27
topics:
- kubernetes
---

**Namespaces** are a [built-in resource type](overview.md) in Kubernetes. They provide a mechanism to **group resources** within a cluster. You typically group resources that belong to the same application into a namespace.

All Kubernetes resources lives within a namespace.

> [!TIP]
> While it's possible to put all resources in the default namespace (see [below](#initial-namespaces)), it's not recommended - because you would end up with lots and lots of resources in that namespace and that makes it harder to understand the applications running in the cluster.

> [!NOTE]
> Namespace are ***not* a security/isolation mechanism**; i.e. containers of one namespace can communicate with containers in other namespaces without problems.

## Commands

List all existing namespaces:

```sh
kubectl get namespace
kubectl get namespaces
kubectl get ns
```

Get current namespace (requires [kubens](https://github.com/ahmetb/kubectx)):

```sh
kubens
```

Switch the current namespace (requires [kubens](https://github.com/ahmetb/kubectx)):

```sh
kubens <namespace_name>
```

See resources in a namespace:

```sh
kubectl get <resource_type> -n <namespace_name>
```

Create namespace without yaml file:

```sh
kubectl create namespace <namespace_name>
```

Delete namespace - **and all the resources in it**:

```sh
kubectl delete namespace <namespace_name>
kubectl delete -f <namespace_resource>.yaml
```

## Resource YAML

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-new-namespace
```

Apply via `kubectl apply -f <filename>`.

## Initial Namespaces

There are 4 initial namespaces:

* `default`
* `kube-node-lease`
* `kube-public`
* `kube-system`

The `default` namespace just exists so that you can deploy namespaces without the need to first create a namespace.

The other 3 namespaces are system namespaces that contain pods/resources required by Kubernetes itself.
