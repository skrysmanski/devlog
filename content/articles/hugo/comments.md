---
title: Comments in Hugo Templates
topics:
- hugo
---

Comments in [Hugo templates](https://gohugo.io/templates/) can be defined with (no whitespace trimming):

```hugo-template
{{/* This is a comment. */}}
```

Or (with whitespace trimming):

```hugo-template
{{- /* This is a comment. */ -}}
```

You can also combine these two:

```hugo-template
{{/* This is a comment. */ -}}
{{- /* This is a comment. */}}
```

As with all Hugo template blocks, a hyphen (`-`) [trims all whitespace](https://gohugo.io/templates/introduction/#whitespace) before or after the block.

```warn
These two variants are *only* supported ways. Note especially that neither `{{ /*` nor `*/ }}` are valid (with a space).
```

```note
You can also use HTML comments which basically function like `{{/* ... */}}` (i.e. without whitespace trimming).
```
