---
title: 'Projects in Visual C++ 2010 - Part 3: Precompiled Headers'
date: 2011-11-09T13:53:00+01:00
topics:
- cpp
- visual-studio
- tutorials
draft: true
---

In this part of the "Projects in Visual C++ 2010" mini series another important aspect of C++ programming is explain: *precompiled headers*. Precompiled headers (or precompiled header files) in many cases significantly reduce the time needed to compile a project.

Here at work I have a C++ project with about 50 `.cpp` files in it. The project uses the Qt library and all files only include the absolute minimum of header files required. Without precompiled headers, compiling the project takes about 56 seconds. *With* precompiled headers, the compile time goes down to about 7 seconds. That's eight times faster.

**Related Articles:**
* [[1725]]
* [[1722]]

<!--more-->

The procedure described here only applies to Visual C++ (if I'm correct since version 6.0). However, other C++ compilers may provide similar functionality.

## The Problem

The problem precompiled headers solve is the long compile time when compiling a C++ project. (Note that other languages such as Java or C# don't have this problem.) The underlying problem is the `#include <...>` statement. This simply copies the whole content of the file included into the source file. While one header file may not be that big, it may also include other header files. When using a framework (such as Qt or even Win32), one include statement will import a huge amount of source code. And this huge amount is what takes so long when compiling a C++ project. Furthermore, if this huge amount gets included in every source code file, all of it has to be compiled again for every source file.

So, the idea is to (pre)compile these huge amount of source code *once*, and then reuse it in every source code file of the project. This drastically reduces the compile time required.

## Specifying the precompiled header (stdafx.h)

To be able to use a precompiled header in Visual C++, one first needs to specify which headers shall be precompiled. Visual C++ only allows one precompiled header file per project. By default, it's called **stdafx.h**. This name can be changed in the project settings under "C++" --> "Precompiled Headers" --> "Precompiled Header File".

The limitation that only one precompiled header is allowed is no real limitation because you can include any header file from within the precompiled header. For example, a precompiled header may look like this (for using the Qt framework):

```c++ line=1
#pragma message("Compiling precompiled headers.\n")

#include <QtCore>
#include <QtXml>
#include <QtGui>
```

So when this header is precompiled, all included headers will be precompiled as well. Thus, the more of the headers you use in your project are specified here, the faster the other files in the project compile. Note that including more header files than are actually used is not a problem.

You may also note the `#pragma` statement on the first line. This is just "helper statement". With it, every time the precompiled header is compiled, the specified message will be printed to the build output. If you see this message twice or more while compiling a single project, something is wrong. (In most cases you won't see the message at all because the precompiled header is already compiled.)

## Using the Precompiled Header

Whether to use a precompiled header or not can be specified per project as well as per file. When you want to use a precompiled header in a project, you usually say "Use" for the whole project and then exclude certain `.cpp` file that shall not use the precompiled header. Both options are in the same section - it just depends on whether you open the project settings or the file settings (both being available through their context menus).

To enable precompiled headers in a project (or file), open the project settings (or file settings) and select "Use" under "C++" --> "Precompiled Headers" --> "Precompiled Header". Also make sure, that you've selected "All Configurations" from the "Configuration" dropdown field. (Note that the option "Create" will be used [below](#compiling_the_header).)

![Enabling precompiled headers in the project settings](enable-precompiled-headers.png)

The next thing you need to do is to `#include "..."` the precompiled header file in every source file (`.cpp`). You shouldn't (can't?) include it in the header files (`.h`) but only in the `.cpp` file. Also, the include statement must be *the first statement* in the file (only comments or whitespace is allowed above it). This is because Visual C++ assumes that everything before the include statement is already compiled.

So the beginning of a `.cpp` file in your project may look like this:

```c++
// File with some fancy functions.
#include "stdafx.h"
#include "myfancefunctions.h"
...
```

Note that the name of the precompiled header file is the one you specified above (or "stdafx.h" by default).

## Compiling the Header {#compiling_the_header}

By now, we've specified which headers are to be compile and where these headers will be used. The last step is to actually compile the precompiled header. Without this you'll get a "Cannot open precompiled header file" error message when compiling the project.

For this you need to add a new `.cpp` file to your project. By convention, it has the same name as the precompiled header but that's no strict requirement. This file only needs to contain one statement:

```c++
// stdafx.cpp
#include "stdafx.h"
```

Next, you need to go to the *file's* settings (via context menu) and change the value of "Precompiled Header" from "Use" to "Create".

![Marking file as precompiled header](creating-precompiled-header.png)

That's it. Now, when compiling the project again for the first time, the precompiled header will be created. After that, compiling the other source files should be significantly faster than before. Also the precompiled header will only be compiled on the first run. After that it won't be compiled again (which would somehow defeat its purpose) unless either the "stdafx.cpp" or "stdafx.h" file is modified.
