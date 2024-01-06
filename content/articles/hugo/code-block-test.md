---
title: Hugo Code Block Test
topics:
- hugo
- markdown
---

This page lists various code blocks to test Hugo code blocks.

For supported languages and their names, see: <https://gohugo.io/content-management/syntax-highlighting/#list-of-chroma-highlighting-languages>

## Supported Language + Line Highlights

### First Line

```c# {hl_lines="1"}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

namespace PInvokeTest {
  class Program {
    static void Main(string[] args) {
      print_line("Hello, PInvoke!");
    }

    [DllImport("NativeLib.dll")]
    private static extern void print_line(string str);
  }
}
```

### Multiple Lines

```c# {hl_lines="5 10 13 14"}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

namespace PInvokeTest {
  class Program {
    static void Main(string[] args) {
      print_line("Hello, PInvoke!");
    }

    [DllImport("NativeLib.dll")]
    private static extern void print_line(string str);
  }
}
```

## Unsupported langue with line highlighting

```looks-like-c#-but-is-not {hl_lines="5 10 13 14"}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

namespace PInvokeTest {
  class Program {
    static void Main(string[] args) {
      print_line("Hello, PInvoke!");
    }

    [DllImport("NativeLib.dll")]
    private static extern void print_line(string str);
  }
}
```

```looks-like-html-but-is-not {hl_lines="3 6"}
<html>
  <head>
    <title>Hello, HTML</title>
  </head>
  <body>
    <p>Some text here</p>
  </body>
</html>
```

## HTML

### Highlighted

```html
<html>
  <head>
    <title>Hello, HTML</title>
  </head>
  <body>
    <p>Some text here</p>
  </body>
</html>
```

### Plain

```
<html>
  <head>
    <title>Hello, HTML</title>
  </head>
  <body>
    <p>Some text here</p>
  </body>
</html>
```
