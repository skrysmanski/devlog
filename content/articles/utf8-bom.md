---
title: UTF-8 and BOM
date: 2020-03-22
oldContentWarning: false
topics:
- unicode
---

When it comes to text file encoding, it usually boils down to two options:

1. UTF-8 with [BOM](https://en.wikipedia.org/wiki/Byte_order_mark)
1. UTF-8 without BOM

There's lots of discussion about this. This document explains the decisions about when to use BOM and when to not use it.

```note
This document is only about *file* encoding. It does not apply to anything else - especially *not* to encoding in network traffic (like HTTP).
```

## Summary

The end result is as follows:

* By default, files are encoded with UTF-8 **without BOM**.
* UTF-8 **with BOM** is selected only for specified file types - for which it is known that the BOM doesn't cause any problems.

So basically there is/will be a UTF-8-BOM [whitelist](https://en.wikipedia.org/wiki/Whitelisting).

The remainder of this document explains the reasons behind this decision.

## The Underlying Problem

Most of the time, the question about the BOM only becomes relevant for non-English languages - such as German with its umlauts (ä, ö, ü) or Asian languages.

While most software developers write code and comments in English, not everyone does so (especially comments).

And even if all code and comments are written in English, there are still places where non-English characters can appear in code files:

* If the software is written for a non-English market, it may contain **literal strings** in the target language (like status or error messages).
* Code comments may contain the **names of code authors**. And these names may contain non-English characters.

## Why use the BOM at all?

Due to historic reasons, there is not just one text encoding (i.e. UTF-8) but there are many text encodings (ASCII, UTF-16, code pages).

So, when a text editor or a compiler reads a text file, it has to guess the file's encoding. And it sometimes guesses wrong - [even in the year 2020](https://github.com/microsoft/vscode/issues/33720).

But when a file is encoded with UTF-8 **with BOM**, the text editor or compiler doesn't have to guess anymore. The BOM literally tells the editor/compiler that the file is encoded with UTF-8. And that's a good thing.

## Why not always use the BOM?

So if the BOM is a good thing, why not always use it?

One would assume that nowadays every piece of (maintained) software out there should be able to handle the UTF-8-BOM - but unfortunately, this is not the case.

While probably all text editors and compilers can handle the UTF-8-BOM, there are some commonly used pieces of software that can't handle it:

* On Linux/Unix, files with a [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)) must not have a BOM.
* On Windows, Batch scripts (`.cmd`, `.bat`) must not have a BOM.

The shebang is especially "tricky" when writing cross-platform script files. For example, on Windows a PowerShell script may very well be encoded with UTF-8-BOM. But if the same script file contains a shebang for Linux/Unix, it must instead be encoded with UTF-8 without BOM - or it won't work on Linux/Unix.

## The Solution (Compromise)

So what's the solution? I'm recommending to work with a compromise:

> By default all files are encoded with **UTF-8 without BOM**. But file types that can handle the BOM will be encoded with **UTF-8 with BOM**.

Especially code files or resource files that contain end-user visible texts should be encoded with UTF-8-BOM to avoid encoding problems (i.e. weird characters).

This compromise works under the assumption that compilers/interpreters assume UTF-8 as text encoding by default (instead of guessing the encoding). This should be true for the majority of all compilers/interpreters.
