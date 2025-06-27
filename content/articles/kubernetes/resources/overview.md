---
title: Kubernetes Resources
description: Overview over resources in Kubernetes
date: 2025-06-27
topics:
- kubernetes
---

Kubernetes is primarily based on resources (Pods, Deployments, Services, ...) - and each resource is usually defined as a YAML file:

```yaml
apiVersion: <version>
kind: <resource_type>
metadata:
  name: <resource_name>
```

Resources are then created or updated with [`kubectl`](../kubectl.md):

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
> This is how `kubectl apply -f` and `kubectl delete -f` determine which resource to create/alter/delete.

## Naming Convention

The Kubernetes documentation uses capitalized names for resources, e.g. "Pod" instead of "pod", or "Deployment" instead of "deployment". We'll follow this convention here.

## Resource Files

Resources files in Kubernetes are YAML files like this:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: echo-server-clusterip
spec:
  type: ClusterIP
  selector:
    app: echo-server
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 5678
```

> [!TIP]
> Kubernetes supports **multiple documents per YAML file**. You separate documents with `---`. See [this section](service-clusterip.md#demo-app) for an example.

## Built-in Resources

Kubernetes provides the following built-in resources (ordered from basic to advanced):

* **Organization:**
  1. [Namespaces](namespaces.md)
* **Service Processes:**
  1. [Pods](pods.md)
  1. [ReplicaSets](replica-sets.md)
  1. [Deployments](deployments.md)
* **Networking:**
  1. [Services](services.md)
     1. [Service - ClusterIP](service-clusterip.md)
     1. [Service - NodePort](service-nodeport.md)
     1. [Service - LoadBalancer](service-loadbalancer.md)

## Custom Resources {#custom-resources}

Kubernetes can be extended with custom resources.

## Controllers

Conceptually, for each resource there is a controller in Kubernetes.

For example, there is a deployment controller that manages the resource [Deployment](deployments.md).

Controllers continually watch for new or changed resources in the Kubernetes cluster and make sure, the desired state described in the resource matches the clusters actual state. And if it doesn't match, they (try to) rectify it.

For example, if you have a deployment with 3 replicas, the deployment controller makes sure that they are always 3 replicas running. If there are less, it starts new replicas until the desired replica count matches the actual replica count.

Controllers for [custom resources](#custom-resources) usually run inside their own [Pod](pods) while built-in resources may or may not run inside a dedicated Pod (it depends on which Kubernetes cluster software you're using).

> [!TIP]
> Most of the time, it's not important to understand how controllers work exactly - but it may be helpful to know that controllers exist in Kubernetes and what they do in general.
