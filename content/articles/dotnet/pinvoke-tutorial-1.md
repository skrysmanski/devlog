---
title: 'P/Invoke Tutorial: Basics (Part 1)'
date: 2012-05-29T15:29:00+01:00
topics:
- dotnet
- cpp
- pinvoke
draft: true
---

P/Invoke is a way of calling C/C++ functions from a .NET program. It's very easy to use. This article will cover the basics of using P/Invoke.

//Note:// This tutorial will focus on Windows and thus use Visual Studio. If you're developing on another platform or with another IDE, adopting the things in this article should be easy enough.

<!--more-->

= Project Structure ===========
For this tutorial, we need a small project structure containing two projects:

 * //NativeLib// : a C++ library project
 * //PInvokeTest// : a C# console project

To get you started real quick, you can download the project structure here:

  [[file:PInvokeTest.zip]]

If you're not using Visual Studio 2010 (or don't want to use the provided zip file), adopt the following settings.

For project //NativeLib//, go to the project settings and (for all configurations):

 * under `C/C++` --> `Preprocessor` --> `Preprocessor Definitions` add `MYAPI=__declspec(dllexport)`
 * under `C/C++` --> `Advanced`: change `Calling Convention` to `__stdcall (/Gz)`

For project //PInvokeTest//:

 * Specify //NativeLib// as dependency for //PInvokeTest//. Right click on //PInvokeTest// and choose `Project Dependencies...`. Then select //NativeLib// and hit `OK`.
 * Change the `Output path` (under project settings: `Build`) to `../Debug` and `../Release` for the different `Configuration`s respectively.

= Simple P/Invoke ========
First, let's create a native function called `print_line()`.

Add a file called `NativeLib.h` to //NativeLib// (or replace it contents):

```c
#ifndef _NATIVELIB_H_
#define _NATIVELIB_H_

#ifndef MYAPI
  #define MYAPI
#endif

#ifdef __cplusplus
extern "C" {
#endif

MYAPI void print_line(const char* str);

#ifdef __cplusplus
}
#endif

#endif // _NATIVELIB_H_
```

Then, add `NativeLib.cpp`:

```c
#include "NativeLib.h"
#include <stdio.h>

MYAPI void print_line(const char* str) {
  printf("%s\n", str);
}
```

Now, let's call this function from the //PInvokeTest// project. To do this, add the highlighted lines to `Program.cs`:

```c# line=1 highlight=5,10,13,14
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

The most important lines in this sections are //lines 13 and 14//. Here we're specifying the C/C++ function to import into our .NET class. There are a couple of things to note about this:

 * The modifier is `static extern`. `extern` means that the function is imported from C/C++. `static` is necessary because the function has no knowledge about the class `Program`.
 * The name of the function matches the name of C/C++ function.
 * The type of parameter `str` is a .NET type (here: `string`). P/Invoke automatically converts (also called: //marshals//) data types from .NET to C/C++ and the other way around.
 * The attribute `[DllImport]` specifies the name of DLL file from which we import the function. //Note:// [[http://msdn.microsoft.com/en-us/library/system.runtime.interopservices.dllimportattribute.aspx|DllImport]] allows you to control almost every aspect of the import, like providing a different .NET method name or specifying the calling convention.

Now compile the project and it should print `Hello, PInvoke!` to the console.

You can download the complete project here:

  [[file:PInvokeTest-Complete.zip]]

= Troubleshooting ===============
There are a couple of things that can go wrong with P/Invoke.

== Unable to load DLL =============
You may get a `DllNotFoundException` with an error message like "The specified module could not be found."

[[image:dll-not-found.png|center|medium|link=source]]

As the error message suggests the DLL "NativeLib.dll" could not be found.

The problem here is that Visual Studio doesn't copy native DLLs to the output directory of .NET projects.

Solution: Change the output directory of the .NET project (//PInvokeTest//) to match the output directory of the native project (//NativeLib//). In //PInvokeTest//'s project settings under `Build` choose `../Debug` and `../Release` for `Output path` in the respective configuration.

== Stack Imbalance ==============
You may get an error saying that a `PInvokeStackImbalance was detected`.

[[image:stack-imbalance.png|center|medium|link=source]]

The reason is most likely that the native library uses another //calling convention// then the .NET project. By default, C/C++ projects use the `__cdecl` calling convention, whereas `[DllImport]` uses `__stdcall` by default.

Solution: Make sure the calling conventions match. Either:

 * Specify the correct calling convention in `[DllImport]`, for example `[DllImport("NativeLib.dll", CallingConvention=CallingConvention.Cdecl)]`
 * Change the default calling convention for the native project. This is done in the project settings under `C/C++` --> `Advanced` --> `Calling Convention`.
 * Add the desired calling convention to the desired C/C++ functions, for example: `void __stdcall print_line(const char* str)`. This will only change the calling convention for these functions.

In most cases, it doesn't matter what calling convention you use. There are some differences, though. You can read more about these differences in the Code Project article [[http://www.codeproject.com/Articles/1388/Calling-Conventions-Demystified|Calling Conventions Demystified]] (Section: Conclusion).

= Portability ===================
On non-Windows systems you can use [[http://www.mono-project.com|Mono]] to execute .NET applications. If you're planning on supporting multiple platforms with your .NET code, I suggest you either:

 * Don't specify a file extension (`.dll`) in `[DllImport]`, like `[DllImport("NativeLib")]`. This way the appropriate file name will be chosen automatically. Note, however, that this only works as long as there is no dot in the file name (like in `System.Network.dll`).
 * Or: Always specify the full Windows file name (i.e. including file extension) and use [[http://www.mono-project.com/Interop_with_Native_Libraries#Library_Names|Mono's library mapping mechanism]] to map platform-dependent file names to Windows file names.

= C++/CLI =======
Besides P/Invoke, the other way of integrating C/C++ functions is using C++/CLI. Although C++/CLI performs better than P/Invoke it also has several drawbacks:

 * You need to learn a new language (if you only know C#; even if you know C++ as well). See my [[cpp-cli-cheat-sheet|C++/CLI Cheat Sheet]] for an overview.
 * C++/CLI is not supported by Mono; so you can use C++/CLI assemblies //only on Windows//.

= Read On =======
You can find more information about P/Invoke here:

 * http://www.mono-project.com/Interop_with_Native_Libraries

%% Article is to be imported by CodeProject
<a href="http://www.codeproject.com/script/Articles/BlogFeedList.aspx?amid=274673" rel="tag" style="display:none">CodeProject</a>
