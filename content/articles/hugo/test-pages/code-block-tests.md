---
title: Hugo Code Block Tests
description: This page lists various code blocks to test Hugo code blocks.
topics:
- hugo
- markdown
- test-page
---

This page lists various code blocks to test Hugo code blocks.

For supported languages and their names, see: <https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md>

## Unstyled

    $ ping6 fe80::b4:f9f6:e5e9:727e
    connect: Invalid argument
    And here we have a very long line with a long URI: https://gohugo.io/content-management/syntax-highlighting/#list-of-chroma-highlighting-languages

```
$ ping6 fe80::b4:f9f6:e5e9:727e
connect: Invalid argument
And here we have a very long line with a long URI: https://gohugo.io/content-management/syntax-highlighting/#list-of-chroma-highlighting-languages
```

## Base (no line numbers or line highlights)

```c#
// This is a very long line that will intersect with the language text and copy button if we're not careful.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

// By the way, this is a very long line that will cause the code block to get a horizontal scroll bar!!!

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

## Line Highlights

```c# {hl_lines="1-3;6 8,13 16 17"}
// This is a very long line that will intersect with the language text and copy button if we're not careful.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

// By the way, this is a very long line that will cause the code block to get a horizontal scroll bar!!!

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

## Everything

### Supported Language (line numbers and line highlights)

```c# {lineNos=true,hl_lines="1 6 8 13 16 17"}
// This is a very long line that will intersect with the language text and copy button if we're not careful.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

// By the way, this is a very long line that will cause the code block to get a horizontal scroll bar!!!

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

### Plain Text (line numbers and line highlights)

``` {lineNos=true,hl_lines="1 6 8 13 16 17"}
// This is a very long line that will intersect with the language text and copy button if we're not careful.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;

// By the way, this is a very long line that will cause the code block to get a horizontal scroll bar!!!

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

### Plain Text (no line numbers or line highlights)

```
This is a simple text
that should be printed as is.
```

### Plain Text (line numbers but no line highlights)

``` {lineNos=true}
This is a text that requires highlighting
and thus must have the <span>s and classes.
```

### Plain Text (not line numbers but line highlights)

``` {hl_lines="2"}
This is a text that requires highlighting
and thus must have the <span>s and classes.
```

### Unsupported Language (line numbers and line highlights)

```looks-like-c# {lineNos=true,hl_lines="1 6 11 14 15"}
// This is a very long line that will intersect with the language text and copy button if we're not careful.
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

## HTML and Angular Brackets

### Highlighted HTML

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

### Plain Text HTML

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

### Angular brackets

**Supported language:**

```c#
var stringListType = typeof(List<string>);
```

**Unsupported language:**

```looks-like-c#
var stringListType = typeof(List<string>);
```

**Plain text (fenced code block):**

```
var stringListType = typeof(List<string>);
```

**Plain text (indented code block):**

    var stringListType = typeof(List<string>);

## Shell

```shell
CHANNEL=stable sh -c "$(curl -fsSL https://get.docker.com)"
```

```shell
$ CHANNEL=stable sh -c "$(curl -fsSL https://get.docker.com)"
```

```shell
> CHANNEL=stable sh -c "$(curl -fsSL https://get.docker.com)"
```
