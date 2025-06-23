---
title: WSL (Windows Subsystem for Linux)
description: A cheat sheet for WSL (Windows Subsystem for Linux)
topics:
- wsl
- windows
---

This is a cheat sheet for [WSL](https://learn.microsoft.com/en-us/windows/wsl/).

> [!NOTE]
> There is no UI to interact with WSL.

## List all installed distros

```cmd
wsl -l -v
```

> [!TIP]
> This also lists whether the distro is currently running.

## Log into distro

Log into the default distro:

```cmd
wsl
```

Log into any other distro:

```cmd
wsl -d <DistroName>
```

Both commands start the distro, if it's not yet running.

## Shutting down a distro

**WSL automatically stops any distro** if it hasn't been used for a certain time. This timeout is 1 minute by default but can be changed [via `vmIdleTimeout` in the `.wslconfig`](https://learn.microsoft.com/en-us/windows/wsl/wsl-config).

If you still need to kill a distro, use:

```cmd
wsl --terminate <DistroName>
```

To shut down WSL and all of its distros, use:

```cmd
wsl --shutdown
```

## Version and update

Show current WSL version:

```cmd
wsl --version
```

Update to the newest WSL version:

```cmd
wsl --update
```

> [!NOTE]
> This will only update WSL itself but not the distros.
>
> To update a distro, you need to log into the distro and use the distro's own update mechanism.
