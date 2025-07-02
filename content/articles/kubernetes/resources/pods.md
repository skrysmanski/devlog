---
title: Pods - Kubernetes Resources
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

**Official documentation:** <https://kubernetes.io/docs/concepts/workloads/pods/>

## Containers

In its simplest form, a pod contains just one container.

It is, however, possible to have *multiple* containers within a single pod. These containers will then all run on the same machine.

Often, additionally to the primary container, the following "helper" containers are used:

* [Init Containers](https://kubernetes.io/docs/concepts/workloads/pods/init-containers/): They run before the primary container is started.
* [Sidecar Containers](https://kubernetes.io/docs/concepts/workloads/pods/sidecar-containers/): They run alongside the primary container.

## Commands

List all existing pods:

```sh
kubectl get pods                 # for the current namespace
kubectl get pods -o wide         # also show nodes where pods run on
kubectl get pods -n <namespace>  # for a different namespace
kubectl get pods -A              # for all namespaces
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

Forward ports from container to localhost:

```sh
kubectl port-forward <container_name> <port>  # same port in container and host
kubectl port-forward <container_name> <container_port>:<localhost_port>
```

> [!TIP]
> This port forwarding works even if `kubectl` is executed from within a DevContainer.

## Resource YAML

Apply via `kubectl apply -f <filename>`.

Helpful links:

* [Which defaults you should override](https://github.com/BretFisher/podspec)

### Minimal Example

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx  # pod name
spec:
  containers:
    - name: nginx  # container name
      image: nginx:1.29.0
```

> [!NOTE]
> Where the container images are pulled (=downloaded) from depends on the [container runtime](https://kubernetes.io/docs/setup/production-environment/container-runtimes/) used by Kubernetes. K3s and most other Kubernetes distributions use [containerd](https://containerd.io/) (by default) - which pulls images from [Docker Hub](https://hub.docker.com/) (by default).

### Extended Example

The extended example is based on: <https://github.com/BretFisher/podspec>

```yaml
apiVersion: v1
kind: Pod

metadata:
  name: nginx
  namespace: my-namespace  # Which namespace to put this pod into

spec:
  containers:
    - name: nginx
      image: nginxinc/nginx-unprivileged:1.29.0

      ports:  # Ports used by this container; this is mainly for documentation purposes
        - containerPort: 8080  # Is 8080 instead of 80 because pod runs as non-root
          protocol: TCP

      readinessProbe:  # Tells Kubernetes when the container is ready
        httpGet:
          path: /
          port: 8080

      resources:
        requests:
          memory: "25Mi"  # Scheduler finds a node where 25MB RAM is available
          cpu: 0.25       # Scheduler finds a node where 0.25 CPU cores are available
        limits:
          memory: "50Mi"  # If the container more than 50MB RAM, it may get killed
          cpu: 2          # The container can use up to 2 CPU cores

      # Per-container security context
      securityContext:
        allowPrivilegeEscalation: false  # prevent sudo, etc.
        privileged: false                # prevent acting like host root

  terminationGracePeriodSeconds: 600 # default is 30, but you may need more time

  # Per-pod security context
  securityContext:
    # Restrict system calls for containers. RuntimeDefault is the recommended option.
    seccompProfile:
      type: RuntimeDefault

    # Run containers as non-root
    runAsNonRoot: true
    runAsUser: 1001
    runAsGroup: 1001
```

## Resource Requests And Limits

For both requests and limits, you can specify `memory` and/or `cpu`.

### Resource Requests

**Resource requests** tell the pod scheduler the minimum resources a container requires. The scheduler will only put the pod on a node where these resources are free. (For this, it sums up all requests of all containers in the pod.)

The scheduler won't put a pod on a node where the pods resource requests exceed the available resources. The available resources are reduced by the resource request amount of each pod scheduled on that node.

To see the resource capacity (max resource amount) and the allocated resources (used resource amount), use:

```sh
# Look for "Capacity" and "Allocated resources"
kubectl describe node <node_name>
```

> [!NOTE]
> When scheduling a new pod, the **scheduler *only* looks at resource *requests* - *not* at the *actual usage***. This is primarily important for `memory` because the amount of requested memory may not be available on a node (if the actual memory usage of the pods running on this node far exceed their requested memory).

### Resource Limits

**Resource limits** are enforced by the Linux kernel and specify which resource limits must not be exceeded by the container.

A container can't exceed its cpu limit - the kernel prevents that by throttling the process(es) in the container.

If a container exceeds its memory limit, the kernel may kill it - if there is memory pressure on the node.

### Official documentation

* [Resource Management for Pods and Containers](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
* [CPU resource units](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-cpu)
* [Memory resource units](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory)
