---
title: Passing native pointers across C++/CLI assembly boundaries
date: 2012-01-09T10:21:00+01:00
topics:
- cpp-cli
- dotnet
draft: true
---

[C++/CLI](cheat-sheet.md) allows you to mix native C++ code with managed .NET code (which is extremly nice). Mixing such code also allows you to create methods in a .NET class that take or return pointers to native (C++) classes. Unfortunately, this doesn't work out of the box across assemblies (read: DLLs). If you define a .NET class in one assembly and this class has a method that returns a pointer, you may not be able to use this method from within *another* C++/CLI assembly.

This article describes the problem and shows solutions.

<!--more-->

## For the impatient

For those of you that don't want to read the whole article, here's the summary:

* Library providing method with native type:
  * Native types *outside* a C++/CLI project need to be made public in a C++/CLI project via ` #pragma make_public(Type)`
  * Native types *inside* a C++/CLI project need to be made public via keyword `public`.
  * This pragma has to be written in the `.h` file
  * To prevent C3767, include the `.h` file before the pragma (i.e. don't just use a forward declaration).
* Library using the method:
  * Needs to include `.h` file of native type
  * Forward declaration *may* not be enough (gives linker warning)
  * If the native type is defined *inside* a C++/CLI project, the project must be reference in the project settings via "Add Reference" *as well as* "Linker --> Input".

## Preparation

To illustrate the problem, we first create some projects that we can use as basis. Each project will only contain one or two classes, so nothing fancy here. I'll assume you know how to create projects and how to enable and disable the `/clr` compiler switch to create C++/CLI and pure C++ project respectivly.

The first project (called "NativeLib") is a pure C++ (no C++/CLI) and DLL project which provides a native (unmanaged) class called `MyNativeClass`. This class is the type that will later be passed across assembly boundaries. Here's the source code (for the meaning of `NATIVE_LIB_EXPORT`, see [](/cpp/project-tutorial/part-1--create-project.md#exporting-classes)):

```c++
// MyNativeClass.h
#pragma once

#ifdef COMPILE_NATIVE_LIB
  #define NATIVE_LIB_EXPORT __declspec(dllexport)
#else
  #define NATIVE_LIB_EXPORT __declspec(dllimport)
#endif

class NATIVE_LIB_EXPORT MyNativeClass {
public:
  MyNativeClass(int val);

  int getValue() const;

private:
  int m_value;
};
```

```c++
// MyNativeClass.cpp
#include "MyNativeClass.h"

MyNativeClass::MyNativeClass(int val) {
  this->m_value = val;
}

int MyNativeClass::getValue() const {
  return this->m_value;
}
```

That's it for the first project. The second project (named "ManagedProviderLib"; C++/CLI project) will provide the managed class `ManagedProvider` with a method the returns a pointer `MyNativeClass`. Here's the source code:

```c++/cli
// ManagedProvider.h
#pragma once

class MyNativeClass;

public ref class ManagedProvider {
public:
  ManagedProvider();

  MyNativeClass* getNativeClass();

private:
  MyNativeClass* m_nativeClass;
};
```

```c++/cli
// ManagedProvider.cpp
#include "ManagedProvider.h"
#include <MyNativeClass.h>

ManagedProvider::ManagedProvider() {
  this->m_nativeClass = new MyNativeClass(42);
}

MyNativeClass* ManagedProvider::getNativeClass() {
  return this->m_nativeClass;
}
```

This should be pretty straight forward. Additionaly you need to add the project "NativeLib" to the include and library directories of "ManagedProviderLib".

Here's the final project structure:

```
NativeLib (pure C++)
  +- MyNativeClass.h
  +- MyNativeClass.cpp
ManagedProviderLib (C++/CLI)
  +- ManagedProvider.h
  +- ManagedProvider.cpp
```

## The Problem

After we've created our skeletan projects, let's explore the actual problem.

### What does work

First, let's create an example that does work. For this, we create a C++/CLI class called `InternalTestClass` and add it to the "ManagedProviderLib" project. This class will inherit `ManagedProvider` and have a method (`doSomething()`) that calls `ManagedProvider::getNativeClass()`. The project structure now is:

```
NativeLib (pure C++)
  +- MyNativeClass.h
  +- MyNativeClass.cpp
ManagedProviderLib (C++/CLI)
  +- ManagedProvider.h
  +- ManagedProvider.cpp
  +- InternalTestClass.h
  +- InternalTestClass.cpp
```

And here's the source code for `InternalTestClass`:

```c++/cli
// InternalTestClass.h
#pragma once
#include "ManagedProvider.h"

public ref class InternalTestClass : ManagedProvider {
public:
  void doSomething();
};
```

```c++/cli
// InternalTestClass.cpp
#include "InternalTestClass.h"

void InternalTestClass::doSomething() {
  MyNativeClass* nativeClass = getNativeClass();
}
```

`doSomething()` doesn't do anything useful, but the point is that the project *compiles*. So, this shows that we *can* return the pointer to a native class here.

### What doesn't work a.k.a "The Problem"

Now, after having a working example, we'll explore the actual problem. For this, we create a new C++/CLI project (called "ManagedExternalLib") and add a managed class called `ExternalTestClass`. This will have the *same code* as `InternalTestClass`. The only difference is that `ExternalTestClass` is in a different project than its base class `ManagedProvider`. Here's the project structure:

```
NativeLib (pure C++)
  +- MyNativeClass.h
  +- MyNativeClass.cpp
ManagedProviderLib (C++/CLI)
  +- ManagedProvider.h
  +- ManagedProvider.cpp
  +- InternalTestClass.h
  +- InternalTestClass.cpp
ManagedExternalLib (C++/CLI)
  +- ExternalTestClass.h
  +- ExternalTestClass.cpp
```

And here's the source code:

```c++/cli
// ExternalTestClass.h
#pragma once

public ref class ExternalTestClass : ManagedProvider {
public:
  void doSomething();
};
```

```c++/cli
// ExternalTestClass.cpp
#include "ExternalTestClass.h"

class MyNativeClass;

void ExternalTestClass::doSomething() {
  // Compiler error C3767 - candidate function(s) not accessible
  MyNativeClass* nativeClass = getNativeClass();
}
```

In a pure C++ class, this would compile - regardless of whether the "NativeLib" project is on the include and library path or not. We have a forward declaration of `MyNativeClass` and since we only work with the pointer of this class, we don't need to know its size (which would be provided by including "MyNativeClass.h"). Also, since we don't call any methods of `MyNativeClass` we don't need the import lib of "NativeLib".

But then this error doesn't indicate a missing include file nor is it a linker error. Instead the error suggests that the method we want to call isn't accessible (read: it's `private` or `internal`). However, that's not the case here.

## The Solution

The actual problem is not that the (C++/CLI) method is private but that `MyNativeClass` (pure C++) is private. That's even mentioned (very briefly though) in [C3767's description page](http://msdn.microsoft.com/library/19dh8yat(v=VS.100).aspx):

> C3767 may also be caused by a breaking change: native types are now private by default in a /clr compilation;

So, even if the native type was exported (via `__declspec(dllexport)`) in the native library, it can be made private by a managed library. (The reason behind this seems to be that the C++/CLI compiler generates thin (managed) wrappers around native types so that they can be called from managed code. See [here](http://blogs.microsoft.co.il/blogs/sasha/archive/2008/02/16/net-to-c-bridge.aspx) for more information.)

### Native Types From Pure C++ Projects

If the native type is defined in a pure C++ project (or in a framework for which you only have the header files), use ` #pragma make_public(Type)`. You should place it in the `.h` after after including its header. So, our example code for `ManagedProvider.h` changes to this:

```c++/cli
// ManagedProvider.h
#pragma once

#include "MyNativeClass.h"  // <-- this is new (was "class MyNativeClass;" before)
#pragma make_public(MyNativeClass) // <-- this is new

public ref class ManagedProvider {
  ...
};
```

*Notes:*
* Using `make_public` in a `.cpp` file instead of an `.h` file may result in the linker error [LNK2022](http://msdn.microsoft.com/de-de/library/zkf0dz41.aspx) (metadata operation failed).
* The code above swapped the forward declaration (`class MyNativeClass.h`) with the ` #include` statement. This is to be on the safe side. Forward declarations work in some cases, while they don't work in others (resulting again in C3767 compiler errors).

Compiling the whole solution now will give you a linker warning [LNK4248](http://msdn.microsoft.com/de-de/library/h8027ys9.aspx) (unresolved typeref token). To fix this, you need to include the type's `.h` file instead of just creating a forward reference. So, our "ExternalTestClass.cpp" changes to this:

```c++/cli
// ExternalTestClass.cpp
#include "ExternalTestClass.h"

#include <MyNativeClass.h> // <-- new; was "class MyNativeClass;" before

void ExternalTestClass::doSomething() {
  MyNativeClass* nativeClass = getNativeClass();
}
```

Of course, this also allows you to actually do something (e.g. call methods) with the `nativeClass` pointer.

*Note:* If you only want to store a pointer to a native class (i.e. don't do anything with it), you don't need to link against the native type's `.lib` file.

### Native Types From C++/CLI Projects

The pragma `make_public` is used for native types defined in header file you can't change. If, on the other hand, the native type is part of your C++/CLI project ("ManagedProviderLib" in this case), you can prefix the class definition with the keyword `public` (like you would for a managed type):

```c++
// MySecondNativeClass.h
#pragma once

#ifdef COMPILE_PRODUCER_LIB
  #define PRODUCER_LIB_EXPORT __declspec(dllexport)
#else
  #define PRODUCER_LIB_EXPORT __declspec(dllimport)
#endif

// Note that this is still a native type.
public class PRODUCER_LIB_EXPORT MySecondNativeClass {
  ...
};
```

This keyword is only available in C++/CLI projects and has the same effect like `make_public`. ~~Unfortunately, I wasn't able to get this example working, because I couldn't figure out a way to *export* the methods of that type. I'll update this section if I find some new information on that topic. (I've raised [this question at stackoverflow.com](http://stackoverflow.com/questions/8786491/export-native-type-from-c-cli-project).)~~

To use this type in another C++/CLI project, you need to reference the assembly's `.lib` (here "ManagedProviderLib.lib") *twice* in the project settings (here: of "ManagedExternalLib"):

1. Add a reference to the dependency project (here "ManagedProviderLib.lib") in "Common Properties" --> "Framework and References" via "Add Reference...".
1. Also Add a reference to the dependency project in "Linker" --> "Input" --> "Additional Dependencies".

I'm not sure whether linking the same `.lib` file twice is a bug or working as intended, but surely it's not very intuitive.

## Source Code

I've created a small solution (for Visual Studios 2010) that contains the example source code described in this article.

[](CLIAssemblyCrossBoundaryTest.zip)

## History

* 2012-01-09 : Fixed using a native type from a C++/CLI project
* 2012-01-09 : No longer suggests forward declarations for public native types
* 2012-01-09 : Published
