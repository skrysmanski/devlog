---
title: Hugo Info Box Tests
topics:
- hugo
- markdown
- test-page
---

This page lists the various info boxes supported by the dev-log theme - both as code block and as Hugo short code.

## Note

```note
**Code Block:** The difference to `RawFraction` is that `RawFraction` would be displayed as the average since the creation/last reset of the counter, while `AverageCount64` would be displayed as average during the last time frame (usually a second).

![A Test Image](test-image.png)
```

{{< note >}}
**Short Code:** The difference to `RawFraction` is that `RawFraction` would be displayed as the average since the creation/last reset of the counter, while `AverageCount64` would be displayed as average during the last time frame (usually a second).

```markdown
This is a **nested** *fenced* code block inside an info box
(only possible with short codes).
```

![A Test Image](test-image.png)
{{< /note >}}

## Warn

```warn
**Code Block:** The difference to `RawFraction` is that `RawFraction` would be displayed as the average since the creation/last reset of the counter, while `AverageCount64` would be displayed as average during the last time frame (usually a second).

![A Test Image](test-image.png)
```

{{< warn >}}
**Short Code:** The difference to `RawFraction` is that `RawFraction` would be displayed as the average since the creation/last reset of the counter, while `AverageCount64` would be displayed as average during the last time frame (usually a second).

```markdown
This is a **nested** *fenced* code block inside an info box
(only possible with short codes).
```

![A Test Image](test-image.png)
{{< /warn >}}

## Tip

```tip
**Code Block:** The difference to `RawFraction` is that `RawFraction` would be displayed as the average since the creation/last reset of the counter, while `AverageCount64` would be displayed as average during the last time frame (usually a second).

![A Test Image](test-image.png)
```

{{< tip >}}
**Short Code:** The difference to `RawFraction` is that `RawFraction` would be displayed as the average since the creation/last reset of the counter, while `AverageCount64` would be displayed as average during the last time frame (usually a second).

```markdown
This is a **nested** *fenced* code block inside an info box
(only possible with short codes).
```

![A Test Image](test-image.png)
{{< /tip >}}
