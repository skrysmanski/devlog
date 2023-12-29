---
title: DevContainers
topics:
- containers
- docker
- vscode
---

For now, this page is just a quick collection of notes on DevContainers (especially the VSCode integration).

## VSCode DevContainers

Usually, you have two files in the `.devcontainer` folder:

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
