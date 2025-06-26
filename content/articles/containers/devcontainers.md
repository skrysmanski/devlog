---
title: DevContainers
description: A collection of notes on DevContainers
topics:
- containers
- docker
- vscode
---

A collection of notes on DevContainers (especially the VSCode integration).

## Basic

To use DevContainers, you need to create a file named `.devcontainer/devcontainers.json` in your project. For contents, see below.

> [!NOTE]
> You can't set the name of the devcontainer as Docker sees/displays it.

## Links

* [DevContainers Quick Start](https://code.visualstudio.com/docs/devcontainers/tutorial)
* [devcontainer.json reference](https://aka.ms/devcontainer.json)
* [Pre-Built DevContainer Images](https://github.com/devcontainers/images/tree/main/src)

## Minimal Example

```json
{
    "image": "mcr.microsoft.com/devcontainers/base:ubuntu"
}
```

## Extended Example with Dockerfile

### devcontainers.json

```json
// For format details, see: https://aka.ms/devcontainer.json
// For getting started: https://code.visualstudio.com/docs/devcontainers/tutorial
//
// NOTES and TIPS:
//
// * To open a terminal inside the devcontainer, call "Terminal: Create New Terminal" from the VSCode command palette.
// * On Windows, this requires Docker to run as "Linux containers" (not "Windows containers").
//
{
    "name": "Hugo",
    "build": {
        "dockerfile": "Dockerfile"
    },

    // Container Features
    // NOTE: Features may only be available for certain distros (often, only Debian/Ubuntu is supported but not Alpine).
    // All available features: https://containers.dev/features
    // Specification: https://containers.dev/implementors/features/
    "features": {
        "ghcr.io/devcontainers/features/common-utils:2": {
            "installZsh": "true",
            //"username": "node",
            "upgradePackages": "true"
        }/*,
        "ghcr.io/devcontainers/features/node:1": {
            "version": "none"
        },
        "ghcr.io/devcontainers/features/git:1": {
            "version": "latest",
            "ppa": "false"
        }*/
    },

    // Configure tool-specific properties.
    "customizations": {
        // Configure properties specific to VS Code.
        "vscode": {
            // Add the IDs of extensions you want installed when the container is created.
            "extensions": [
                "editorconfig.editorconfig",
                "davidanson.vscode-markdownlint",
                "streetsidesoftware.code-spell-checker",
                "ms-azuretools.vscode-docker"
            ]
        }
    },

    // Set *default* container specific settings.json values on container create.
    /*"settings": {
        "php.validate.executablePath": "/usr/local/bin/php"
    },

    */

    // Use 'forwardPorts' to make a list of ports inside the container available locally.
    "forwardPorts": [1313],

    // Use 'postCreateCommand' to run commands after the container is created.
    //"postCreateCommand": "yarn install --prod",

    // Comment out connect as root instead. More info: https://aka.ms/vscode-remote/containers/non-root.
    "remoteUser": "vscode"
}
```

### Dockerfile

```Dockfile
# See: https://hugomods.com/docs/docker/
# Image is Alpine based and contains both NodeJS and Git.
FROM hugomods/hugo

# Add Git LFS (not installed by default).
RUN apk add --no-cache git-lfs

EXPOSE 1313
```

## SSH Troubleshooting

Normally, VSCode *automatically* forwards the host's ssh-agent into the DevContainer. Here's how this normally works and that can give you a hint at where the problem is.

To see, if ssh works inside the devcontainer (i.e. the ssh-agent from the host is correctly routed to the container), execute:

```sh
$ ssh-add -l
4096 SHA256:WJ2WxTG1F4bHWq29eN+lvc/5VYLhjAZp5b5555PkGis Primary SSH Key (RSA)
```

If this gives you an error, check `$SSH_AUTH_SOCK`:

```sh
$ echo $SSH_AUTH_SOCK
/tmp/vscode-ssh-auth-2d206968-2061-406b-8a9f-a4a2249dc649.sock
```

If this variable is empty, search the contents of the container log (F1 > Dev Containers: Show Container Log) for "SSH_AUTH_SOCK":

```
[16730 ms] Start: Launching Dev Containers helper.
[16730 ms] ssh-agent: SSH_AUTH_SOCK not set on local host.
[16732 ms] ssh-agent: SSH_AUTH_SOCK in container (/tmp/vscode-ssh-auth-2d206968-2061-406b-8a9f-a4a5349dc649.sock) forwarded to local host (\\.\pipe\openssh-ssh-agent).
```

If this doesn't work and you are on Windows, it *may* help to manually set the `SSH_AUTH_SOCK` environment variable to `\\.\pipe\openssh-ssh-agent` ([source](https://github.com/microsoft/vscode-remote-release/issues/11043#issuecomment-3005677524)).
