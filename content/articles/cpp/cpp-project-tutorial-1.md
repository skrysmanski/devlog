---
title: 'Projects in Visual C++ 2010 - Part 1: Creating a DLL project'
date: 2011-11-09T10:39:00+01:00
topics:
- cpp
- visual-studio
- tutorials
draft: true
---

When you write software, you often/sometimes divide your project into several subprojects. This mini series describes how to do this with [[http://www.microsoft.com/visualstudio/en-us/products/2010-editions/visual-cpp-express|Visual C++ 2010]] (but this first part also applies to earlier versions). We start with creating a library project in form of a DLL.

**Related articles:**
 * [[1722]]
 * [[1747]]

<!--more-->

== Library Projects ==
Library projects are projects that usually contain reusable functions or classes. They're a great way of structuring a big project. In Visual C++ (or in C++ in general) there are two types of libraries: static libraries and dynamic libraries.

Static libraries (`.lib`) are "merged" into the final `.exe` file when the whole project is compiled. Therefore, for the outside user, this library type isn't visible.

Dynamic libraries (`.dll`) on the other hand remain separate from the final `.exe` file in their own files. (See more information [[http://msdn.microsoft.com/en-us/library/1ez7dh12.aspx|here]].)

In this article we'll create a //dynamic// library.

== Creating the Library Project ==
To create a library project in Visual C++ 2010 (that is a part of Visual Studio 2010) in an //existing// solution, choose `Add` --> `New Project...` from the solution's context menu in the "Solution Explorer" window.

[[image:add-new-project.png|center|medium|link=source]]

Alternatively you can create a new solution by using `File` --> `New` --> `Project...`. Either way will open up the "Add New Project" dialog. Here you choose "Class Library" (in section `Other Languages` --> `Visual C++`) and specify a new for the project. This name will also be the name of the DLL file.

[[image:create-new-library-project.png|center|medium|link=source]]

After hitting "Ok", your new class library project will be created. By default, it'll create a dynamic library. To verify this, head to the project's settings (available through the project's context menu) and check that `Configuration Type` is set to `Dynamic Library (.dll)`.

[[image:library-project-settings.png|center|medium|link=source]]

You may also want to review the setting `Common Language Runtime Support`. If enabled (switch `/clr`), this will allow you to create .NET classes in this project. For a pure C++ project, however, you may want to disable CLR support (as shown in the screenshot above).

== Writing a Reusable Class ==
The purpose of a library is to provide (potentially) reusable functions and/or classes. So, let's create a simple reusable class.

The new class is called `PrintableInt`. It wraps an integer and provides a `toString()` method that will convert the integer into a string.

```c++
// PrintableInt.h
#pragma once

#include <string>

class PrintableInt
{
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

PrintableInt::PrintableInt(int value)
{
  m_value = value;
}

std::string PrintableInt::toString() const
{
  std::ostringstream builder;
  builder << m_value;
  return builder.str();
}
```

The library should now compile without problems.

Note that the `.cpp` file include a file called `stdafx.h`. This is a so called "precompiled header file". This feature is explained in [[1747|another article]]. It should, however, work out-of-the-box in your project.

== Exporting Classes ==
By default, all classes and functions defined in a library project are "internal". That means that another project can't use them. To change this, classes (or function) that are to be used by other project must be "exported". In Visual C++ you do this with `__declspec(dllexport)`.

Now, you could specify the export like this:

```c++
// PrintableInt.h
class __declspec(dllexport) PrintableInt
{
  ...
}
```

However, since all projects using this library will most likely use the same header file (`PrintableInt.h`), this would mean that even the "using" projects would export the class as well. Of course, this is not what we want. Instead you create a macro and use it like this:

```c++
// PrintableInt.h

#ifdef COMPILE_MYLIBRARY
  #define MYLIBRARY_EXPORT __declspec(dllexport)
#else
  #define MYLIBRARY_EXPORT __declspec(dllimport)
#endif

class MYLIBRARY_EXPORT PrintableInt
{
  ...
}
```

For this to work, you add the preprocessor definition `COMPILE_MYLIBRARY` to the library project (but //not// to the projects using the library). This way `MYLIBRARY_EXPORT` will be replaced by `__declspec(dllexport)` when compiling the library project and by `__declspec(dllimport)` when using the project (from another project). To specify this preprocessor, go to the library project's settings and enter the name `COMPILE_MYLIBRARY` in the field "Preprocessor Definitions". You should also make sure to select "All Configuration" from the "Configuration" dropdown field (see screenshot) so that this definition gets added to the Debug //and// Release configuration.

[[image:preprocessor-definition.png|center|medium|link=source]]

//Note:// The keyword `__declspec(...)` is a Microsoft specific extension to C++ (see [[http://msdn.microsoft.com/en-us/library/3y1sfaz2.aspx|here]]). So it only works in Visual C++. There is an alternative (more portable?) way to specify which classes/functions are to be exported. For this, a "Module-Definition File" (`.def`) needs to be created. However, creating such a file is more tedious than specifying the export statement directly in the code. For more information, see [[http://www.codeguru.com/cpp/cpp/cpp_mfc/tutorials/article.php/c9855|this article]].

Now, when you compile the library project, an additional `.lib` file will be created. This file is used to import the exported classes/functions in another project. (If you don't export anything, the file won't be created.) How to do this, is explained in [[1722|part two of this mini series]].

== dllimport necessary? ==
The example above specifies that `__declspec(dllimport)` is to be used when using the library project. You may notice that this isn't necessary in the above example. However, it doesn't hurt either.

This statement becomes important though when you export templated classes. To demonstrate this, change `PrintableInt` like this:

```c++
// PrintableInt.h
#pragma once

#include <string>

#ifdef COMPILE_MYLIBRARY
  #define MYLIBRARY_EXPORT __declspec(dllexport)
#else
  #define MYLIBRARY_EXPORT //__declspec(dllimport)
#endif

template<int T>
class MYLIBRARY_EXPORT PrintableInt
{
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

template<int T>
PrintableInt<T>::PrintableInt(int value)
{
  m_value = value;
}

template<int T>
std::string PrintableInt<T>::toString() const
{
  std::ostringstream builder;
  builder << m_value;
  return builder.str();
}
```

This adds the type parameter `T` to the class. Note that `__declspec(dllimport)` has been commented out to demonstrate the problem.

//Note:// The type parameter `T` serves no purpose in this implementation. It's just there to demonstrate the problem.

Now, assume another project using the library project like this:

```c++
#include <iostream>
#include "PrintableInt.h"

int _tmain(int argc, _TCHAR* argv[])
{
  PrintableInt<6> test(5);
  std::cout << test.toString() << std::endl;
  return 0;
}
```

Without "dllimport" compiling this project will result in (rather cryptic) linker errors - namely "unresolved external symbol". Uncommenting `__declspec(dllimport)` in `PrintableInt.h` again solves this problem.

[[image:unresolved-symbols.png|center|medium|link=source]]


%% Article is to be imported by CodeProject
<a href="http://www.codeproject.com/script/Articles/BlogFeedList.aspx?amid=274673" rel="tag" style="display:none">CodeProject</a>
