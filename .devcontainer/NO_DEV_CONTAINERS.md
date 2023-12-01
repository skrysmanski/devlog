# DevContainers

This repository doesn't use dev containers primarily because:

**File watching doesn't work for dev containers on Windows.**

This means that Hugo's dev server wouldn't pick up any changes made to the site itself.

This is a deal breaker because it defeats the primary purpose of using Hugo's dev server.

There are also some secondary reasons:

* Building the site inside the container is way slower. On my machine it took Hugo 1.6 seconds to build a site - and it took Hugo 12 seconds inside the dev container.
* It adds a hugo amount of memory usage to the development process (the dev container usually takes about 4-6 GB of memory to run.)
