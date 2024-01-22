---
title: C++/CLI Cheat Sheet
date: 2013-07-31
topics:
- cpp-cli
- cheat-sheets
- dotnet
---

This article provides a quick comparison between C++/CLI and C#. It's meant for those who know C# (and possibly C++) and will explain which C++/CLI language construct correspond with which in C#. (I don't know Visual Basic so I can't add infos about this here.)

```note
This is not a complete reference but rather quick reference for those features that are (in my opinion) the most unclear.
```

<!--more-->

## Introduction

C++/CLI is - as the name suggest - an extension of C++ to allow it to use Microsoft's .NET framework including the CLR (common language runtime; i.e. garbage collection and such things).

C++/CLI is the successor of "Managed C++", which felt unnatural to many developers. However, both "languages" have the same goal: combine native code with managed code.

```note
C++/CLI is currently only available on Windows. At the time of writing (mid 2010) there are no plans in the Mono project to support C++/CLI. Such support would be necessary as a C++/CLI compiler creates mixed code that contains native and managed code. While the managed code could be executed by the Mono runtime the native can't. Therefore a C++/CLI library can't be used on Linux or MacOSX (or any other Mono supported OS).
```

See also:

* <http://www.codeproject.com/KB/mcpp/cppcliintro01.aspx>
* <http://www.codeproject.com/KB/books/CppCliInActionCh1Ex1.aspx>
* <http://www.codeproject.com/KB/mcpp/cppcliarrays.aspx>
* [/clr compiler switch on MSDN](http://msdn.microsoft.com/library/k8d11d4s.aspx)

## Handles

C++/CLI allows for two reference/pointer types:

* **native pointers (*, &):** Pointers as they're known from C/C++. They are not garbage collected and must be managed manually in the code. Created with `malloc()` or `new`.
  Example: `char*`, `MyClass&`
* **handles (^):** Handles are the references as they're used in C# (or all other .NET languages). Handles are garbage collected (meaning you don't need to free them manually) and are created by `gcnew` (instead of `new` with pointers).
  Example: `String^`, `array<String^>^`

The members of *handles* are accessed with the "->" operator (and not with the "." operator).

## CLR types

A type (class, struct) becomes a CLR type when it's being prefixed with a specific keyword.

* **Native types:** `class`, `struct`
* **Managed types:**
  * **C# class:** `ref class`, ~~`ref struct`~~
  * **C# struct:** ~~`value class`~~, `value struct`
  * **C# interface:** `interface class`, ~~`interface struct`~~
  * **C# enum:** `enum class`, `enum struct`

*Notes:*

* In C++ `struct` and `class` can be used interchangeably with the difference that all C++ `struct` members are public by default while all C++ `class` members are private by default. To avoid confusion `ref struct`, `value class`, and `interface struct` should not be used. There are therefore stroke-through in the list above. For an `interface class`, however, all members are public automatically.
* Don't forget to terminate a type declaration (even `class`es and `struct`s) with a semicolon; i.e. use `ref class MyClass { };`. Otherwise you will get compiler errors. (Just mention this here as this is not necessary in C#.)
* In C++/CLI a CLR type can be used as a handle or directly on the stack, i.e.: `MyCLRType^ myHandleVar` (handle on heap) vs. `MyCLRType myStackVar` (stack)

### Native and managed types on stack and heap

Handles can only "contain" managed types. Managed types can sit on the stack or in a handle, but not in a pointer.

```c++/cli
class MyNativeTestClass {
  ...
};

public ref class MyManagedTestClass {
  ...
};

void test() {
  MyNativeTestClass native1;
  MyNativeTestClass* native2 = new MyNativeTestClass();
  MyNativeTestClass^ native3 = gcnew MyNativeTestClass(); // ERROR

  MyManagedTestClass managed1;
  MyManagedTestClass* managed2 = new MyManagedTestClass(); // ERROR
  MyManagedTestClass^ managed3 = gcnew MyManagedTestClass();
}
```

### Handles and Value Types (.Net Structs and Enums)

Since value types (ie. `value struct` and `enum class`) are passed-by-copy, you usually don't use handles on them but use them directly. Instead you create them directly on the stack (ie. without `gcnew`) like this:

```c++/cli
Point Test() {
  Point pt(2, 5);
  return pt;
}

MyEnum Test2() {
  return MyEnum::MyEnumValue;
}
```

Using a handle on a value type essentially create a [boxed](http://msdn.microsoft.com/en-us/library/yz2be5wk%28v=vs.80%29.aspx) version of that value type. In managed code, all `value struct`s will be converted into `ValueType` types and all `enum class`es will be converted into `Enum` types.

For example the following C++/CLI code (with `Point` being a *value type* and `MyEnum` being an *enum class*):

```c++/cli
public ref class MyTestClass {
public:
  void Test1(Point pt, Point^ pt2) { }
  void Test2(MyEnum en, MyEnum^ en2) { }
};
```

From a C# project, this class definition will look like this:

```c#
public class MyTestClass {
  public void Test1(Point pt, ValueType pt2);
  public void Test2(MyEnum en, Enum en2);
}
```

### Casting Handles

There are several ways to cast a handle to another type:

* **safe cast:** Casts the handle to the other type, if possible, and throws an exception if the cast isn't possible due to incompatible types. This is identical to a C# type cast. Examples:
  * `(NewType^)myHandle`
  * `safe_cast<NewType^>(myHandle)`
* **dynamic cast:** Casts the handle to the other type, if possible, and returns `nullptr` if the cast isn't possible due to incompatible types. This is identical to the C# keyword `as` (or `is`, if used in a condition). Examples:
  * `dynamic_cast<NewType^>(myHandle)`
  * `if (dynamic_cast<NewType^>(myHandle) != nullptr) { ... }`
* **static cast:** This is the equivalent of a C++ type cast; i.e. not type checking is done. Doing an invalid cast on a handle this way will result in undefined behavior. Can't be used when the compiler option "/clr:safe" is enabled. Example:
  * `static_cast<NewType^>(myHandle)`

### Passing handles

Passing a handle to or from a method works in C++/CLI as expected. The handle inside the method identifies the same instance that it identified outside of the method (i.e. the object is passed as reference and not as copy).

```c++/cli
void ChangeString(MyClass^ str) {
  str.myInnerString = "New string";
}

// In main()
MyClass^ str = gcnew MyClass("Old string");
ChangeString(str);
Console::WriteLine(str.myInnerString);
```

This code changes `myInnerString` as expected.

To pass the reference to the handle itself (C# keyword `ref`), the `%` operator must be used (like the `&` operator in C++):

```c++/cli
void ChangeString(String^% str)
{
  str = "New string";
}

// In main()
String^ str = "Old string";
ChangeString(str);
Console::WriteLine(str);
```

This again changes the string. Note the `%` in `ChangeString()`.

**Notes:**

* For the C# keyword `out`, the parameter must also be prefixed with the `[Out]` attribute (from `System::Runtime::InteropServices`). For example: `void ChangeString([Out] String^% str)`
* Unlike in C# `out` and `ref` don't need to be specified when calling methods using the `%` operator.
* Handles are type-safe, i.e. you can't cast them to anything aren't.
* Handles can't be cast to or from `void^`.

### Mixing native and managed types

This section gives a quick overview what is allowed with handles and what isn't.

|                                                            | Native Classes               | Managed Classes
| ---------------------------------------------------------- | ---------------------------- | ---------------
| Methods with native types (as parameters or return types)  | Yes (copy and reference)     | Yes (copy and reference); this method will only be callable from C++/CLI code (but not from C# code) |
| Methods with managed types (as parameters or return types) | Yes (copy and handle)        | Yes (copy and handle)
| Fields with native type                                    | Yes (direct and pointer)     | Only pointer
| Fields with managed type                                   | value types directly; handles via `gcroot` (see below) | Values types and handles

*Important:* Passing pointers of native types across assembly (dll) boundaries requires some more work. See [](passing-native-pointers.md) for more information.

To be able to store a handle as field in a native class, wrap it in a [gcroot](http://msdn.microsoft.com/library/481fa11f.aspx) instance, like so: `gcroot<String^> m_myMember`.

```c++/cli
#include <vcclr.h>
using namespace System;

class CppClass {
public:
   gcroot<String^> str;   // can use str as if it were String^
};

int main() {
   CppClass c;
   c.str = gcnew String("hello");
   Console::WriteLine(c.str);   // no cast required
}
```

### Type Of

To get the type of an object, simply use:

```c++/cli
obj->GetType()
```

To get a type of a class, use:

```c++/cli
// identical to type(MyClass) in C#
MyClass::typeid
```

### Forward declaration

To use a CLR type before having declared it, use this:

```c++/cli
ref class MyClass;
```

Note that no visibility modifier (like `public`) must be user here, even if the actual class has public visibility.

## Modifiers: visibility

Visibility modifiers for class/struct members are used as in C++:

```c++/cli
  public:
    int my_public_var;
    String^ my_public_string;
```

Visibility modifiers for classes/structs themselves are prefixed before the CLR type keyword (i.e. like used as in C#):

```c++/cli
public ref class MyClass { };
private value struct MyStruct { }; // internal struct
```

Classes/structs without visibility modifier will be interpreted as `internal` (which is `private` in C++/CLI).

Beside using a single visibility modifier, C++/CLI allows the developer to specify *two modifiers*. The rule here is: The higher visibility is used inside the assembly and the lower visibility outside the assembly.

Here's a list of supported modifiers:

| Scope           | C++/CLI             | C#
| --------------- | ------------------- | --------
| Classes/Members | `public`            | `public`
| Members         | `protected`         | `protected`
| Members         | `private`           | `private`
| Classes         | `private`           | `internal`
| Members         | `internal`          | `internal`
| Members         | `public protected`  | `internal protected`
| Members         | `protected private` | not possible (i.e. you can't define this in C# although it's a valid CLR visibility)

## Modifiers: abstract, sealed, static

If the modifiers `abstract` and `sealed` needs to be specified after the class name but before the inheritance operator:

```c++/cli
public ref class MyTestClass2 abstract : MyTestClass { };
```

The meaning of these keywords translates directly into C#. *Combining both keywords* results in a `static` C# class/struct.

For members (methods and fields) the keywords `abstract` and `sealed` must be specified after the parameter list:

```c++/cli
virtual void Func() abstract;
```

`static`, on the other hand, must be specified before the return type:

```c++/cli
static int MyFunc();
```

## Modifiers: const, readonly

To sum it up:

| C++/CLI    | C#         | Note                  |
| ---------- | ---------- | --------------------- |
| `literal`  | `const`    | Compile-time constant |
| `initonly` | `readonly` | Runtime constant      |

So, for example, this C++/CLI code:

```C++/CLI
class MyClass {
public:
  literal String^ MY_LITERAL = "Hello World";

  static initonly int MY_INITONLY = 5;
  initonly int myInitOnly;
};
```

will translate into this C# code:

```c#
public class MyClass {
  public const string MY_LITERAL = "Hello World";

  public static readonly int MY_INITONLY;
  public readonly int myInitOnly;
}
```

## Inheritance

Inheritance for CLR types is like you know it from C#. Therefore just some notes:

* *Only public inheritance* is allowed for CLR types. This doesn't work:
   `ref class Derived1 : private Base {}; // which would be allowed in C++`
   If no visibility is specified, `public` will be assumed automatically.
* *Multiple inheritance* isn't supported by the CLR (although it is by C++).
* "value" types can only inherit interfaces but not classes.
* "value" types are automatically sealed.

## Arrays

Arrays are defined like this in C++/CLI:

* `array<int>^ myArr1`
* `array<String^>^ myArr2`
* `array<String^> myArr3  // sits on the stack`

Arrays (if they're a handle) are created using "gcnew":

* Regular array:
   `array<int>^ strarray = gcnew array<int>(5); // 5 elements`
* Multi-dimensional array:
   `array<String^,2>^ names = gcnew array<String^,2>(4,3); // 4x3 elements`
* Jagged array (array of arrays):
   `array<array<int>^>^ arr = gcnew array<array<int>^>(5);`

Accessing an element works like in C# or C++:

```c++/cli
myArray[5]  // retrieves or sets the 6th array element
```

All C++/CLI arrays are direct subclasses of `System::Array`. Thus, the *size of an array* can be obtained through the property `Length`.

More information:

* [General information on C++/CLI arrays](http://msdn.microsoft.com/de-de/library/ts4c4dw6(v=VS.100).aspx)
* [System::Array members overview](http://msdn.microsoft.com/library/system.array(v=VS.100).aspx)

## Properties

The easiest way to define a .NET property is like this:

```c++/cli
property String^ MyProperty;
```

This is called a *trivial property* and the compiler will automatically generate a getter and a setter for this property. So, basically it's identical to `string MyProperty { get; set; }` in C#.

Note, however, that there is no way to make a trivial property where getter or setter has another visibility than the property - eg. `string MyProperty { get; private set; }` has no equivalent in C++/CLI. Also you can't make read-only or write-only trivial properties in C++/CLI.

In most cases, however, you want to specify some code for your property. Here's how it's done.

```C++/CLI
private:
  String^ field;
public:
  property String^ SomeValue {
    String^ get() { return field; }
    void set(String^ value) { field = value; }
  }
```

You can also specify the visibility directly for one of the accessor methods and thereby turning the property read-only or write-only:

```C++/CLI
private:
  String^ field;
public:
  property String^ SomeValue {
    String^ get() { return field; }
    private: void set(String^ value) { field = value; }
  }
```

And if you want to separate definition (`.h` file) from implementation (`.cpp` file), you do it like this:

```C++/CLI
// .h file - assume class is "MyClass"
private:
  String^ field;
public:
  property String^ SomeValue {
    String^ get();
    void set(String^ value);
  }

// .cpp file
String^ MyClass::SomeValue::get() {
  return field;
}

void MyClass::SomeValue::set(String^ value) {
  field = value;
}
```

Read on: <http://www.codeproject.com/KB/mcpp/CppCliProperties.aspx>

## Constructors

Constructors in C++/CLI have the same syntax as in C++. There's one limitation though: [Constructor chaining](http://www.csharp411.com/constructor-chaining/) is not supported in C++/CLI (although .NET supports it).

### Static Constructors

Static constructors are automatically called by the CLR when the class is "loaded". They're defined just as in C#, must be private though.

```c++/cli
public ref class MyClass {
private:
  static MyClass() { } // <- Static constructor
public:
  MyClass() { } // <- Regular constructor
};
```

## Destructors and Finalizers

The terms and syntax for destructors and finalizer may be somewhat confusing between C++, C++/CLI and C#. Therefore here is an example:

```c++/cli
ref class MyClass // : IDisposable (this is automatically added by the compiler)
{
public:
  MyClass();  // constructor
  ~MyClass(); // (deterministic) destructor (converted into
              // IDisposable.Dispose() by the compiler)
protected:
  !MyClass(); // finalizer (non-deterministic destructor)
              // (converted into "virtual void Finalize()" by the compiler)
};
```

You only need destructor *and* finalizer when the class hosts some unmanaged data (e.g. a pointer to a C++ class). If you don't have unmanaged data in your class, you neither need destructor nor finalizer (unless you have some members implementing `IDisposable`).

```warn
The destructor (`Dispose()`) will **not** be called automatically from the finalizer.
```

Since freeing unmanaged resources should occur in the finalizer (see [](idisposable-and-co.md)), the default implementation pattern for finalizer and destructor looks like this:

```c++/cli
ref class DataContainer {
public:
  ~DataContainer() {
    if (m_isDisposed)
       return;

    // dispose managed data
    //delete m_managedData;
    this->!DataContainer(); // call finalizer
    m_isDisposed = true;
  }

  // Finalizer
  !DataContainer() {
    // free unmanaged data
    //DataProvider::DeleteUnmanagedData(m_unmanagedData);
  }

private:
  bool m_isDisposed; // must be set to false
};
```

### Calling the Destructor

There are two ways of calling the (deterministic) destructor (i.e. `~MyClass()`) in C++/CLI.

When an object sits on the stack, its destructor is automatically called when the variable goes out of scope:

```c++/cli {hl_lines="5"}
int main() {
  MyClass myClazz;
  myClazz.DoSomething();
  // Destructor gets called when the function returns
}
```

On the other hand, when an object is created on the GC heap, use `delete` to call its destructor:

```c++/cli {hl_lines="5"}
int main() {
  MyClass^ myClazz;
  myClazz->DoSomething();
  // Call destructor
  delete myClazz;
}
```

## Events and Delegates

Delegates are basically pointers (or "handles") to .NET methods. The can be called directly or be used as event handlers.

### Delegates

You create a delegate by passing `this` and a pointer to method to its constructor.

```c++/cli {hl_lines="11"}
using namespace System;

ref class CliClass {
public:
  void MyHandler(Object^ sender, EventArgs^ args);
};

int main() {
  CliClass^ clazz = gcnew CliClass();
  // Create delegate instance
  EventHandler^ handler = gcnew EventHandler(clazz, &CliClass::MyHandler);
}
```

To call a delegate, simply call it like a regular function:

```c++/cli {hl_lines="3"}
int main() {
  EventHandler^ handler = gcnew EventHandler(clazz, &CliClass::MyHandler);
  handler(nullptr, EventArgs::Empty); // or use "Invoke()"
}
```

To define a custom delegate, use the `delegate` keyword:

```c++/cli
public delegate double Addition(double val1, double val2);
```

### Events

To assign a delegate to an event, use the `+=` operator just as in C#:

```c++/cli
dispatcherTimer->Tick += gcnew EventHandler(this, &MyClass::OnTick);
```

Creating an event is pretty much the same as in C#. Just use the keyword `event` together with the desired delegate type:

```c++/cli {hl_lines="3"}
public ref class CExercise {
public:
  event EventHandler^ MyCustomEvent;
};
```

Calling an event is identical to calling a delegate:

```c++/cli
this->MyCustomEvent(this, EventArgs::Empty);
```

```note
Checking the event against `nullptr` isn't required in C++/CLI (unlike C#). That's because the event's `raise()` method automatically checks whether there are actually any event handlers ([source](http://stackoverflow.com/a/2014752/614177)).
```

## Templates and Generics

C++/CLI classes can use C++ templates as well as .NET generics. Since templates aren't visible in .NET (but generics are), we'll skip them here. See the link below for more information.

Generic class:

```c++/cli
generic<typename T> where T : IDog
ref class GenRef {
  void DoAll();
  T myDog;
};
```

Implementation of a method from a generic class:

```c++/cli
generic<typename T> where T : IDog
void GenRef<T>::DoAll() {
  t->Bark(0);
  t->WagTail();
}
```

Constraining to class/struct:

```c++/cli
// T can only be a reference type
generic<typename T> where T : ref class, Object
ref class ConstrainedToClass { };

// T can only be a value type (struct, number type, enum)
generic<typename T> where T : value class, ValueType
ref class ConstrainedToValueType { };
```

See also: [Using generics in C++/CLI](http://www.codeproject.com/KB/mcpp/cppcligenerics.aspx)

### nullptr for generic reference types

To return/pass `nullptr` for a generic parameter use `T()`. For example:

```c++/cli
generic<typename T> where T : ref class, Object
T MyClass::ReturnNull() {
  // return nullptr; - doesn't work; you'll get
  // C2440 (cannot convert from 'nullptr' to 'T')

  return T();
}
```

```note
The syntax of `T()` may be misleading. It does **not** create an instance of `T` on the stack and call `T`'s default constructor (as the syntax would suggest). It indeed results in `nullptr`.
```

## Referencing managed type from other file (in the same project)

Using a managed type that comes with an assembly (dll) in a C++/CLI file is simple: Simply use it - either fully qualified or with `using`.

```c++/cli
void MyClass::MyMethod() {
  // Defined in .NET Assembly "System".
  System::Uri^ myUri = gcnew System::Uri("http://manski.net");
  ...
}
```

Using a managed type that comes *from another file in the same project* on the other hand requires you to include it in the file you want to use it. Or to be more precise: You need to include its method signatures (`.h` file( - not the actual implementation (`.cpp` file).

```c++/cli
#include "MyOtherClass.h"

void MyClass::MyMethod() {
  // Defined in the same project
  MyOtherClass^ myClass = gcnew MyOtherClass();
  ...
}
```

So, if you have separated the class into a `.h` and a `.cpp` file, include the `.h` file. If, on the other hand, you want to write your class in one file (like in C#), you need to create a `.h` file (and not a `.cpp` file) and include this file.

## Preprocessor

By enabling the common language runtime support for a project (i.e. making it a C++/CLI project rather than a pure C++ project), a preprocessor definition called `_MANAGED` will be defined (with value `1`):

```c++/cli
#ifdef _MANAGED
  // This part is only included in C++/CLI projects.
  doSomething();
#endif
```

Also defined are `__cplusplus_cli` and `__CLR_VER`. For more information, see [Predefined Macros](http://msdn.microsoft.com/library/b0084kay.aspx).

## Glossary

Garbage Collector (GC)
: reclaims garbage, or memory used by objects that will never be accessed or mutated again by the application.

Common Language Infrastructure (CLI)
: It is an open specification that defines a runtime environment that allows multiple high-level languages to be used on different computer platforms without being rewritten for specific architectures.

Common Type System (CTS)
: a standard that specifies how Type definitions and specific values of Types are represented in computer memory, so programs in different programming languages can easily share information.

Base Class Library (BCL)
: a standard library available to all languages using the .NET Framework, comparable in scope to the standard libraries of Java.

Framework Class Library (FCL)
: a collection of thousands of reusable classes, interfaces and value types, within hundreds of namespaces. BCL is a part of FCL and provide the most fundamental functionality.

Mono
: Free .NET (CLI) alternative available on Linux, Mac OS X and Windows. The development is usually behind the development of Microsoft's .NET implementation (e.g. while Microsoft supports .NET 4.0, Mono only supports .NET 2.0).

## History

What happened to this article:

* **2013-07-31:** Added more information about generic constraints and `nullptr` with generics
* **2013-07-05:** Added section about forward declarations
* **2012-01-13:** Improved info about `gcroot`, delegates and events, and improved destructors section
* **2012-01-11:** Updated information about preprocessor defines and added history section
* **2012-01-10:** Added section about C#'s `typeof` equivalent in C++/CLI
* **2012-01-09:** Added note about passing native pointer across assembly boundaries
* **2012-01-04:** Added section about constructors
* **2011-12-20:** Added section about templates and generics
* **2011-12-19:** Added some notes about CLR arrays and preprocessor definitions
* **2011-08-29:** Added section about handles and pointers as members of managed and native classes
* **2011-08-26:** Added section about managed and native classes on the heap, stack, and GC heap
* **2011-08-19:** Added section "Referencing managed type from other file (in the same project)"
* **2011-08-09:** Added sections about .NET properties and the C# modifiers `const` and `readonly`
* **2011-06-15:** Added information about value types and their relationship to handles
* **2011-05-02:** Formatting and added scope to modifier table
* **2011-04-19:** Published
