---
title: "Hugo: Implicit/Indirect Assets"
topics:
- hugo
---

Sometimes you have assets in your Hugo theme that are *not* used directly in your theme but indirectly.

In my case, I'm using [npm](https://www.npmjs.com/) to download/update [Font Awesome](https://fontawesome.com/). This creates the following structure in my `assets` folder:

![Font Awesome webfont files](webfonts@2x.png)

To tell Hugo to include all the webfont files in the generated output, use this snippet:

```hugo-theme
{{- range (resources.Match "node_modules/@fortawesome/fontawesome-free/webfonts/*") -}}
    {{- .Publish -}}
{{- end -}}
```
