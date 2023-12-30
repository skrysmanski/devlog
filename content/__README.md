# Hugo Content Directory

This directory contains all files that Hugo will convert into HTML.

Reference: <https://gohugo.io/content-management/>

## Articles

All articles go into the `articles` folder.

To Hugo, `articles` is both a [Hugo Section](https://gohugo.io/content-management/sections/) and a [Content Type](https://gohugo.io/content-management/types/).

### Markdown Extensions

Hugo supports standard Markdown plus extensions provided by its Markdown parser (Goldmark).

For a list of supported Markdown extensions, see: <https://github.com/yuin/goldmark/#built-in-extensions>

### Emojis

Hugo supports Emojis. For a full list, see: <https://gohugo.io/quick-reference/emojis/#introduction>

### Content Summaries

Hugo supports the `<!--more-->` summary divider.

See: <https://gohugo.io/content-management/summaries/>

## Ignored Files

This file is ignored by Hugo. File ignores are configured in the `hugo.yaml` file - like this:

```yaml
module:
  mounts:
    - source: 'content'
      target: 'content'
      # Exclude files from the 'content' directory
      excludeFiles:
        - '__README.md'
```
