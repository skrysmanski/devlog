---
title: Hugo Shortcode Tests
topics:
- hugo
- test-page
---

This test page tests custom shortcodes provided by the dev-log theme.

## abbr

```
{{</* abbr "BMP" "Basic Multilingual Plane" */>}}
```

Unicode {{< abbr "BMP" "Basic Multilingual Plane" >}}

## icon

```
{{</* icon creative-commons brands */>}}
```

CC BY-NC 4.0
{{< icon creative-commons brands >}}
{{< icon creative-commons-by brands >}}
{{< icon creative-commons-nc brands >}}

## pagedate

```
{{</* page-date */>}}
```

This page was last updated on {{< page-date >}}.

## center

```
{{</* center >}}
This **should** be centered.
{{</ center */>}}
```

Some text before.

And some paragraph before (to check spacing).

{{< center >}}
This **should** be centered.

And this should *also* be centered and use {{< color "#FF00FF" >}}*fuchsia* as color{{</ color >}}.

![A test image to see if this also works for images.](test-image-small.png)
{{</ center >}}

Some text after.

## color

```
{{</* color "#FF00FF" >}}hex colors{{</ color */>}}
```

This part after this word {{< color red >}}should **be** red{{</ color >}} but not this part.

We even {{< color "#FF00FF" >}}support *hex colors*{{</ color >}} - just awesome.
