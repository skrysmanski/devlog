---
title: Hugo Code Block Test
topics:
- hugo
- markdown
---

This page lists various code blocks to test Hugo code blocks.

For supported languages and their names, see: <https://gohugo.io/content-management/syntax-highlighting/#list-of-chroma-highlighting-languages>

## Base

```c#
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

```c# {hl_lines="1 5 7 12 15 16"}
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

### Supported Language

```c# {lineNos=true,hl_lines="5 7 12 15 16"}
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

### Plain Text

``` {lineNos=true,hl_lines="5 7 12 15 16"}
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

### Unsupported Language

```looks-like-c#-but-is-not {lineNos=true,hl_lines="5 10 13 14"}
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

## HTML (no line highlights)

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
