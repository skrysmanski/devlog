---
title: 'P/Invoke Tutorial: Passing strings (Part 2)'
date: 2012-06-11T10:42:00+01:00
topics:
- dotnet
- cpp
- pinvoke
draft: true
---

In the [[2525|previous tutorial]] we passed a single string to a native C/C++ function by using P/Invoke.

This function was defined like this:

```c++
// C++
void print_line(const char* str);
```

```c#
// C#
[DllImport("NativeLib.dll")]
private static extern void print_line(string str);
```

However, there exists a hidden pitfall here:

*What happens when the user passes a **non-ASCII** character to this function?*

<!--more-->

## ASCII and Unicode: A Historical Overview

Historically there was ASCII which defined characters up to character number 127 (i.e. everything that fits into 7 bits). However, these 128 characters contained only letters used in English. Umlauts (like Ä, Ö, Ü) and other characters were not present. So, the 8th bit was used to map these characters, but the mapping was not standardized. Basically each country had its own mapping of the region 128 - 255. These different mapping were called *code pages*.

For example, on code page 850 (MS-DOS Latin 1) the character number 154 is Ü (German Umlaut) while on code page 855 (MS-DOS Cyrillic) the very same character number represents џ (Cyrillic small letter DZHE).

To unify these different mapping the *Unicode standard* was established in 1991. The idea was (and is) to give each existing character a unique id. These ids are called *code points*. So basically the Unicode standard is "just" a much bigger version of the ASCII standard. The latest version as of writing is Unicode version 6.1 which covers over 110,000 characters.

Along with the Unicode standard several *encodings* were developed. Each encoding describes how to convert Unicode code points into bytes. The most famous ones are *UTF-8* and *UTF-16*.

Please note that *all* encodings can encode *all* Unicode code points. They just differ in the way they do this.

If you want to experiment a little bit with Unicode, there is a [Unicode Explorer](http://unicode.mayastudios.com) I've written. Go ahead and give it a try.

## P/Invoke String Conversions

Back to the actual problem. With the parameter of `print_line()` defined as `const char*` (and `char` being 8 bit) it's not clear which code page to use for the strings passed to this function.

Instead, let's change the parameter type to Unicode (also sometimes referred to as "wide characters"):

```c++
void print_line(const wchar_t* str);
```

No, let's also adopt the C# mapping:

```c#
[DllImport("NativeLib.dll", CharSet = CharSet.Unicode)]
private static extern void print_line(string str);
```

The only difference here it that we specified the `CharSet` to be Unicode.

With this, **C# will pass strings as UTF-16 encoded strings** to the C++ function.

UTF-16 is, as said before, an encoding the converted Unicode code points into bytes and the other way around. In UTF-16 each code point is either encoded with one or with two `WORD`s (16 bit values). The most frequently used code points will fit into one `WORD`, the less frequently used code points fit into two `WORD`s (called a "*surrogate pair*").

**Important:** There is no ISO C way of how to print Unicode characters to the console. `wprintf()` won't work - at least on Windows.

## Returning Strings

Returning strings is not as trivial as passing them as parameters.

The following is a [quote from Stack Overflow](http://stackoverflow.com/a/370519/614177).

The problem though comes with what to do with the native memory that was returned from `foo()`. The CLR assumes the following two items about a PInvoke function which directly returns the string type

* The native memory needs to be freed
* The native memory was allocated with `CoTaskMemAlloc`

Therefore it will marshal the string and then call `CoTaskMemFree` on the native memory blob. Unless you actually allocated this memory with `CoTaskMemAlloc` this will at best cause a crash in your application.

In order to get the correct semantics here you must return an `IntPtr` directly. Then use `Marshal.PtrToString` in order to get to a managed String value. You may still need to free the native memory but that will dependent upon the implementation of foo.
