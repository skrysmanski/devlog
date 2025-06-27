---
title: ReplicaSets - Kubernetes Resources
description: Overview over Kubernetes ReplicaSets
date: 2025-07-03
topics:
- kubernetes
---

**ReplicaSets** are a [built-in resource type](overview.md) in Kubernetes. They allow you to create multiple copies (i.e. replicas) of pods. They also ensure that the number of specified replicas are always available - even if nodes in the Kubernetes cluster die or crash.

**Concept Hierarchy:**

1. [Pods](pods.md)
1. **ReplicaSets**
1. [Deployments](deployments.md)

> [!NOTE]
> Except for educational purposes, you will never create ReplicaSets directly - instead you will use [deployments](deployments.md).

**Official documentation:** <https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/>

## Relation to Pods

ReplicaSets "extend" the concept of pods.

Let's say we have a pod definition like this:

```yaml {hl_lines="5-8"}
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  containers:
    - name: nginx
      image: nginx:1.29.0
```

To create 3 replicas of this pod, a ReplicaSet specification would look like this:

```yaml {lineNos=true,hl_lines="14-17"}
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx    # matches label below
  template:
    metadata:
      labels:
        app: nginx  # matches selector above
    spec:
      containers:
        - name: nginx
          image: nginx:1.29.0
```

Notice how the `spec:` sections of both definitions are identical.

The ReplicaSet controller in Kubernetes looks for pods that matches the ReplicaSet's `selector`. This is why to have to specify a label for the pod (line 13) and a matching selector for the ReplicaSet (lines 8 and 9).

> [!NOTE]
> Even though, semantically, the ReplicateSet's `selector` *should not* be needed (as it will obviously match the pod defined below), it is required. (You get an error if you don't specify it.)
