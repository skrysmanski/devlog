---
title: Kubernetes Resources
description: Overview over Kubernetes resources
date: 2025-06-27
topics:
- kubernetes
---

Kubernetes is based on resources - and each resource can be written as a YAML file:

```yaml
apiVersion: <version>
kind: <resource_type>
metadata:
  name: <resource_name>
```

Resources are created with [`kubectl`](../kubectl.md):

```sh
kubectl apply -f <resource_file>
```

Resources can also be deleted this way:

```sh
kubectl delete -f <resource_file>
```

> [!TIP]
> Resources can be created both via a yaml file (using `kubectl apply`) and via the command line (using `kubectl create`). It is, however, recommended to use yaml files so that they can be versioned in Git.

Kubernetes has a built-in way to show all supported fields for a resource:

```sh
kubectl explain <resource_type>
```

For example:

```sh
kubectl explain namespaces
kubectl explain namespaces.metadata
```

Each resource type can be queried on the commandline via:

```sh
kubectl get <resource_type>
```

For example:

```sh
kubectl get namespaces
kubectl get pods
```

> [!NOTE]
> Resource **names must be unique** (within their [namespace](namespaces.md)). See [Object Names and IDs](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/) for more details.
>
> This is also how `kubectl apply -f` and `kubectl delete -f` determine which resource to create/alter/delete.

## Built-in Resources

Kubernetes provides the following built-in resources (ordered from basic to advanced):

* **Organization**
   1. [Namespaces](namespaces.md)
* **Execution**
   1. [Pods](pods.md)
   1. [ReplicaSets](replica-sets.md)
   1. [Deployments](deployments.md)
