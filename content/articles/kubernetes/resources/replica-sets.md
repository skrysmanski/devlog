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
>
> However, you still need to understand what ReplicaSets are and how they work because ReplicaSets are used by deployments.

**Internal DNS name**: none

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

The number of replicas is specified in line 6.

Notice how the `spec:` sections of both definitions are identical.

The ReplicaSet controller in Kubernetes looks for pods that matches the ReplicaSet's `selector`. This is why to have to specify a label for the pod (line 13) and a matching selector for the ReplicaSet (lines 8 and 9).

> [!NOTE]
> If you specify more replicas that you have nodes in your cluster, multiple pods will be scheduled on the same node.

> [!NOTE]
> Even though, semantically, the ReplicaSet's `selector` *should not* be needed (as it will obviously match the pod defined below), it is required. (You get an error if you don't specify it.)

## Commands

List all existing ReplicaSets:

```sh
kubectl get replicasets        # for the current namespace
kubectl get rs                 # same; abbreviated name
kubectl get rs -n <namespace>  # for a different namespace
kubectl get rs -A              # for all namespaces
```

This will print something like:

```
NAME    DESIRED   CURRENT   READY   AGE
nginx   3         3         3       7m51s
```

The pods of a ReplicaSet get a random "hash" appended to their name (to avoid naming conflicts):

```sh
> kubectl get pods
NAME          READY   STATUS    RESTARTS   AGE
nginx-lbgp6   1/1     Running   0          11m
nginx-v7v28   1/1     Running   0          11m
nginx-wrs89   1/1     Running   0          11m
```

Note that there's is no simple command to get the pods of a ReplicaSet - but since names are unique in Kubernetes and pods inherit their name from the name of the ReplicaSet, you can use this command:

```sh
kubectl get pods | grep '^my-replicaset-'
```

## One Replica vs. Pod

At first glace, specifying a ReplicaSet with `replicas: 1` may seem to be the same as defining a pod.

In both cases, the pod is scheduled on a random node and container crashes within the pod are also handled by both resource types.

However, there is one difference: What happens if the Kubernetes node where the pod runs becomes unavailable (crash, shut down)?

* **Pod:** Nothing happens. The pod becomes unavailable, too.
* **ReplicaSet:** The pod is rescheduled on a different node (after some timeout).

So, it's generally beneficial to use a ReplicaSet over a pod even if there's just one replica.

Also, nodes with manually created pods [can't be drained](#draining-a-node).

## Rescheduling of Pods

Pods managed by a ReplicaSet can get rescheduled - i.e. usually (but not always) moved to another node.

Pods are rescheduled if the actual pod count no longer matches the `replica` count of a ReplicaSet. This can happen for [various reasons](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/), for example:

1. The pod's node becomes unavailable (e.g. because it's shut down or can no longer be reached over the network).
1. The pod exceeds its [memory limit](pods.md#resource-limits).
1. The pod is manually deleted.

> [!NOTE]
> For reasons 1 and 2, it is said that the pod got "evicted" - which basically means "deleted because of an error".

### Rescheduling and Nodes

Pods get rescheduled when their node becomes unavailable. However, this does *not* happen immediately.

1. First, an unreachable node is marked as **NotReady** after a short grace period (default: 50 seconds; [`node-monitor-grace-period`](https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/)).

   This grace period prevents pod rescheduling if the node just reboots because of some OS updates.
1. After that, pods get **evicted** after another grace period (default: 5 minutes; [`tolerationSeconds`](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/#taint-based-evictions))

Note that this only applies to pods that belong to a ReplicaSet. Pods that were created individually won't get rescheduled.

### Draining a Node

Before restarting a node, you can drain it - i.e. move all pods to different nodes:

```sh
kubectl drain --ignore-daemonsets <node>
```

This will set the node's status to **SchedulingDisabled** - meaning no new pods will be scheduled on this node.

Notes:

* [**DaemonSets**](DaemonSets.md) can't (and normally don't need to) be drained. The parameter `--ignore-daemonsets` prevents errors from undrainable DaemonSets (and is generally safe and common practice to use).
* **Pods with controller** (i.e. manually created pods) can't be drained and result in errors.
* Even in case of errors, the node's status will be set to **SchedulingDisabled**.

To make a node schedulable again, use:

```sh
kubectl uncordon <node>
```

> [!WARNING]
> **Kubernetes does *not* automatically rebalance pods on nodes that rejoin the cluster** (because Kubernetes generally favors stability over disruption).
>
> So, if a node gets drained (either manually or because all of its pods got evicted) and then rejoins the cluster, **it will stay empty** (except for DaemonSets) until new pods are scheduled.
>
> So while draining a node before a reboot might *seem* like a good idea, it actually creates "permanent" additional load on all other nodes.
>
> One way to solve this problem is the [Descheduler for Kubernetes](https://github.com/kubernetes-sigs/descheduler).
