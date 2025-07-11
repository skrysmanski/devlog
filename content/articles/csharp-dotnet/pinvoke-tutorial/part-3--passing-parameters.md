---
title: 'P/Invoke Tutorial: Passing parameters (Part 3)'
date: 2012-06-11
topics:
- dotnet
- cpp
- pinvoke
aliases:
- /2012/06/11/pinvoke-tutorial-passing-parameters-part-3/
- /2012/06/pinvoke-tutorial-passing-parameters-part-3/
---

P/Invoke tries to make your life easier by automatically converting ("marshalling") data types from managed code to native code and the other way around.

<!--more-->

See also:

* [](part-1--basics.md)
* [](part-2--passing-strings.md)
* [](part-4--pinning.md)

## Marshalling Primitive Data Types

Primitive data types (`bool`, `int`, `double`, ...) are the easiest to use. They map directly to their native counterparts.

| C# type  | C/C++ type                           | Bytes     | Range
| -------- | ------------------------------------ | --------- | -----
| `bool`   | `bool` (with `int` fallback)         | usually 1 | `true` or `false`
| `char`   | `wchar_t` (or `char` if necessary)   | 2 (1)     | Unicode {{< abbr "BMP" "Basic Multilingual Plane" >}}
| `byte`   | `unsigned char`                      | 1         | 0 to 255
| `sbyte`  | `char`                               | 1         | -128 to 127
| `short`  | `short`                              | 2         | -32,768 to 32,767
| `ushort` | `unsigned short`                     | 2         | 0 to 65,535
| `int`    | `int`                                | 4         | -2 billion to 2 billion
| `uint`   | `unsigned int`                       | 4         | 0 to 4 billion
| `long`   | `__int64`                            | 8         | -9 quintillion to 9 quintillion
| `ulong`  | `unsigned __int64`                   | 8         | 0 to 18 quintillion
| `float`  | `float`                              | 4         | 7 significant decimal digits
| `double` | `double`                             | 8         | 15 significant decimal digits

## Marshalling Strings

For passing strings, it's recommended that you pass them as Unicode strings (if possible). For this, you need to specify `Char.Unicode` like this:

```c#
[DllImport("NativeLib.dll", CharSet = CharSet.Unicode)]
private static extern void do_something(string str);
```

This requires the C/C++ parameter type be a `wchar_t*`:

```c++
void do_something(const wchar_t* str);
```

For more details, see [](part-2--passing-strings.md).

## Marshalling Arrays

Arrays of primitive types can be passed directly.

```c#
[DllImport("NativeLib.dll")]
private static extern void do_something(byte[] data);
```

## Marshalling Objects

To be able to pass objects you need to make their memory layout sequential:

```c# {hl_lines="1"}
[StructLayout(LayoutKind.Sequential)]
class MyClass {
  ...
}
```

This ensures that the fields are stored in the same order they're written in code. (Without this attribute the C# compiler reorder fields around to optimize the data structure.)

Then simply use the object's class directly:

```c#
[DllImport("NativeLib.dll")]
private static extern void do_something(MyClass data);
```

The object will be passed by reference (either as `struct*` or `struct&`) to the C function:

```c++
typedef struct {
  ...
} MyClass;

void do_something(MyClass* data);
```

> [!NOTE]
> The order of the fields in the native struct and the managed class *must be exactly the same*.

## Marshalling Structs

Marshalling managed `struct`s is almost identical to marshalling objects with only one difference: `struct`s are passed by copy by default.

So for `struct`s the C/C++ function signature reads:

```c++
void do_something(MyClass data);
```

Of course, you can pass the `struct` also by reference. In this case, use `(MyClass* data)` or `(MyClass& data)` in C/C++ and `(ref MyClass data)` in C#.

## Marshalling Delegates

Delegates are marshalled directly. The only thing you need to take care of is the "calling convention". The default calling convention is `Winapi` (which equals to `StdCall` on Windows). If your native library uses a different calling convention, you need to specify it like this:

```c#
[UnmanagedFunctionPointer(CallingConvention.Cdecl)]
public delegate void MyDelegate(IntPtr value);
```

## Marshalling Arbitrary Pointers

Arbitrary pointers (like `void*`) are marshalled as `IntPtr` objects.

So this C function:

```c++
void do_something(void* ptr);
```

becomes:

```c#
[DllImport("NativeLib.dll")]
private static extern void do_something(IntPtr ptr);
```
