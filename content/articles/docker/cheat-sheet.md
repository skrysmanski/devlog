---
title: Docker Cheat Sheet
date: 2018-12-29
topics:
- docker
- cheat-sheet
---

## Installing Docker

### Windows

<https://hub.docker.com/editions/community/docker-ce-desktop-windows>

### MacOS

<https://hub.docker.com/editions/community/docker-ce-desktop-mac>

### Linux

```shell
CHANNEL=stable sh -c "$(curl -fsSL https://get.docker.com)"
```

### Test Docker

```shell
docker run --rm hello-world
```

## Running Containers

Run container in *foreground*:

```shell
docker run --rm -ti <imagename>
```

Run container in *background*:

```shell
docker run --rm -d <imagename>
```

Port mapping:

```shell
docker run -p <host_port>:<container_port> ...
```

Container name:

```shell
docker run --name <containername> ...
```

Mount host volume:

```shell
docker run -v <abs_dir_host>:<abs_dir_container>
docker run -v $(pwd)/<rel_dir_host>:<abs_dir_container> ...
```

## Building Images

Build container:

```shell
docker build --tag <imagename> .
```

## Debugging and Analysis

Get into a container

```shell
docker exec -ti <container> bash
```

## Listing Things

All images:

```shell
docker images
```

All running containers:

```shell
docker ps
```

All containers (including stopped):

```shell
docker ps -a
```

Volumes/Mounts of a container:

```shell
docker container inspect -f '{{ range .Mounts }}{{ .Name }}:{{ .Destination }} {{ end }}' <container>
```

## Cleanup

See: <https://docs.docker.com/config/pruning/>

```shell
docker system prune
docker image prune -a
docker container prune
docker volume prune
```
