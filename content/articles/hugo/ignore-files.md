---
title: Ignore Content Files in Hugo
description: How to ignore content files when rendering website with Hugo.
topics:
- hugo
---

To tell Hugo to ignore files in the `content` directory, use this configuration in your `hugo.yaml` file:

```yaml
module:
  mounts:
    - source: 'content'
      target: 'content'
      # Exclude files from the 'content' directory
      excludeFiles:
        - '**/__README.md'
        - '**/*.drawio'
```

See also: [Official Documentation on this feature](https://gohugo.io/hugo-modules/configuration/#module-configuration-mounts)

{{< note >}}
Hugo also supports the [`ignoreFiles` directive](https://gohugo.io/getting-started/configuration/#ignore-content-and-data-files-when-rendering) but using the `module` way seems to be preferred.
{{</ note >}}
