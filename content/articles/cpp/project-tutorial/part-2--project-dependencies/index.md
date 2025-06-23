---
title: 'Projects in Visual C++ 2010 - Part 2: Project Dependencies'
date: 2011-11-09
topics:
- cpp
- visual-studio
- tutorials
aliases:
- /2011/11/09/project-dependencies-in-visual-c/
- /2011/11/project-dependencies-in-visual-c/
---

This article is the second part of the subprojects mini series. This part will show how to use a DLL library project in another project.

Referencing a library in C++ (or, more specific, with Visual C++) is somewhat cumbersome - or should I say, *used to be* somewhat cumbersome. Fortunately, with the release of Visual C++ 2010 this has been greatly simplified. This article first shows the old way and then describes the new (simple) way.

**Related Articles:**

* [](part-1--create-project.md)
* [](part-3--precompiled-headers.md)

<!--more-->

## The setup

For the discussion of this article assume we have two projects:

* MyLibrary
* MyProgram (which uses MyLibrary)

The project "MyLibrary" compiles into a DLL library (although a static `.lib` might also work) and "MyProgram" is just a regular `.exe` project.

### The Code: MyLibrary

"MyLibrary" uses the code from the first part of this series. It provides a class called `PrintableInt` which wraps an integer and provides a method to convert it into a string.

```c++
// PrintableInt.h
#pragma once

#include <string>

#ifdef COMPILE_MYLIBRARY
  #define MYLIBRARY_EXPORT __declspec(dllexport)
#else
  #define MYLIBRARY_EXPORT __declspec(dllimport)
#endif

class MYLIBRARY_EXPORT PrintableInt {
public:
  // Constructor
  PrintableInt(int value);
  // Converts the int into a string.
  std::string toString() const;
private:
  int m_value;
};
```

```c++
// PrintableInt.cpp
#include "stdafx.h"
#include "PrintableInt.h"
#include <sstream>

PrintableInt::PrintableInt(int value) {
  m_value = value;
}

std::string PrintableInt::toString() const {
  std::ostringstream builder;
  builder << m_value;
  return builder.str();
}
```

Again, this (and the project "MyProgram" as well) use a precompiled header file named "stdafx.h". Precompiled headers are explained in [another article](part-3--precompiled-headers.md).

### The Code: MyProgram

The project "MyProgram" is a "Win32 Console Application" project and just contains some test code in its main function:

```c++
#include "stdafx.h"
#include <iostream>
#include "PrintableInt.h"

int _tmain(int argc, _TCHAR* argv[]) {
  PrintableInt test(5);
  std::cout << test.toString() << std::endl;
  return 0;
}
```

This simply prints a "5" on the console.

## The old way

In Visual C++ 2008 or earlier, to define a project dependency several steps needed to be executed (in no particular order). These steps are described below. Note that these steps still work in Visual C++ 2010.

### Step: Specify Build Order {#specify_build_order}

To determine the order in which the projects of the solution will be built, project dependencies need to be specified. This way dependencies will be built before the projects that use them.

To specify a dependency, select "Project Dependencies..." from a project's context menu. Then check all projects the current project depends on.

![Project Dependencies](project-dependencies.png)

### Step: Specify Include Path {#specify_include_path}

You also need to specify to path where to find the header files of the library project you want to use. This makes it possible to specify a header file by just using `"PrintableInt.h"` instead of `"../MyLibrary/PrintableInt.h"`.

To do this, open the settings of the project that wants to use the library and specify the path under "Additional Include Directories". You should also make sure that you've selected "All Configurations" from the "Configuration" dropdown field (see screenshot).

![Specifying an include path](specifying-include-path.png)

### Step: Specify Lib File

The last step is to specify the path to the `.lib` file of the library project. Note that even DLL projects will create a `.lib` file so that your project can link against the DLL automatically.

To specify the `.lib` file, again go to the project settings, but this time go to `Linker` --> `Input` and specify the file under "Additional Dependencies". Note that you'll need (or probably want) to specify different `.lib` files for the "Debug" and the "Release" configuration. The screenshot below shows the value for the "Debug" configuration.

![Specifying a library dependency](specify-lib-file.png)

## The New Way

Since Visual C++ 2010 there is a new, simpler way to specify a project dependency. With this way, unfortunately you still need to specify the include path to the library project (see [above](#specify_include_path)) but all other steps are simplified.

To reference a dependency the new way, choose "References..." from the project's context menu. This will open up the project settings with the section "Framework and References" being selected. There click on "Add New Reference..." and then select the project you want to use in the current project.

![Specifying a reference](add-new-reference.png)

And that's it. Your project should now compile.

Besides being easier to use, the new way has also another advantage: The information about project dependencies are now stored in the project file instead of the solution file (which is the case with the way described in [](#specify_build_order)). This way you can use a library project that has some dependencies itself in several different solutions and always have the dependencies already set up correctly. (With the old way you had to recreate the dependencies for each solution manually.)

> [!NOTE]
> There are two options - available in the project settings - that influence how these references work. Both can be found under "Linker" --> "General":
>
> * *Ignore Import Library:* This is specified in the library project. When this is set, the `.lib` file generated by the project won't be used automatically by projects that depend on it. (Default: No)
> * *Link Library Dependencies:* This is the opposite of the other option. It's specified on the project that uses other projects. If set to "No", dependencies won't be linked automatically. (Default: Yes)
>
> ![Linker options](automatic-linking-option.png)

### What's not working

Unfortunately, there's one details that make the new way a little more difficult to use again. *sigh* The problem: Visual Studio won't copy the DLL files of the referenced libraries to the output folder automatically. Here's what [the documentation](http://msdn.microsoft.com/en-us/library/ms235636%28v=vs.80%29.aspx) says about that:

> Dynamic link libraries are not loaded by the executable until runtime. You must tell the system where to locate **MathFuncsDll.dll**. This is done using the **PATH** environment variable. To do this, from the **Property Pages** dialog, expand the **Configuration Properties** node and select **Debugging**. Next to **Environment**, type in the following: `PATH=<path to MathFuncsDll.dll file>`, where `<path to MathFuncsDll.dll file>` is replaced with the actual location of **MathFuncsDll.dll**. Press **OK** to save all the changes made.

There are several possible solutions for this problem (although, theoretically, this problem shouldn't arise in the first place):

* Set the output directory to be the same as the directory where the DLL files are compiled to. (recommended)
* Use the "PATH" like describes in the documentation.
