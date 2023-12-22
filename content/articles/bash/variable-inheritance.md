---
title: Bash variable inheritances cheat sheet
date: 2016-10-20T18:05:00+01:00
topics:
- bash
- cheat-sheets
draft: true
---

Just a quick cheat sheet about how variables in Bash get inherited.

== Result ==
Here's the result of a call to `outer.sh` (see below):

```
Call
-------
From Outer (export):    yes
From Outer (no export):
From Inner (export):
From Inner (no export):

Source
-------
From Outer (export):    yes
From Outer (no export): yes
From Inner (export):    yes
From Inner (no export): yes
```

== Test ==

The test consists of two files: `outer.sh` and `inner.sh`.

`outer.sh` is called by the user and internally calls `inner.sh` - once directly and once with `source`.

Contents of `outer.sh`:

```bash
#!/bin/bash

export FROM_OUTER_EXPORT="yes"
FROM_OUTER_NO_EXPORT="yes"

echo "Call"
echo "-------"
./inner.sh
echo "From Inner (export):    $FROM_INNER_EXPORT"
echo "From Inner (no export): $FROM_INNER_NO_EXPORT"

echo
echo "Source"
echo "-------"
source ./inner.sh
echo "From Inner (export):    $FROM_INNER_EXPORT"
echo "From Inner (no export): $FROM_INNER_NO_EXPORT"
```

Contents of `inner.sh`:

```bash
#!/bin/bash

echo "From Outer (export):    $FROM_OUTER_EXPORT"
echo "From Outer (no export): $FROM_OUTER_NO_EXPORT"

export FROM_INNER_EXPORT="yes"
FROM_INNER_NO_EXPORT="yes"
```
