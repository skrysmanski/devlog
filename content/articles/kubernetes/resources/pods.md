---
title: "Kubernetes Resource: Pods"
description: Overview over Kubernetes pods
date: 2025-06-27
topics:
- kubernetes
---

**Pods** are a [built-in resource type](overview.md) in Kubernetes. They are **the foundation** of all applications deployed in Kubernetes.

A pod can contain one or more [containers](https://kubernetes.io/docs/concepts/containers/). Different pods can run on different nodes (meaning: machines) but the containers of a single pod will always **run on the same machine**.

Pods are often cited as the "smallest deployable unit" in Kubernetes - meaning, if you need to deploy a container, you need to "wrap" it in a pod.

> [!NOTE]
> Except for educational purposes, you will never create pods directly - instead you will use [deployments](deployments.md).

## Containers

TODO: init containers and sidecar containers

## Commands

List all existing pods:

```sh
kubectl get pods # for the current namespace
kubectl get pods -n <namespace> # for a different namespace
kubectl get pods -A # for all namespaces
```

See pod logs:

```sh
k logs <pod_name>
```

Exec into a pod/container:

```sh
kubectl exec -it <pod_name> -c <container_name> -- bash
kubectl debug -it <pod_name> --image=<debug_image> -- bash
```

## Resource YAML

Minimal example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx # pod name
spec:
  containers:
  - name: nginx # container name
    image: nginx:1.14.2
```

Apply via `kubectl apply -f <filename>`.
