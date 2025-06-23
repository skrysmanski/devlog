---
title: Line Endings in C# Files
topics:
- csharp
- file-format
- visual-studio
- resharper
---

In my projects I prefer to use Linux/Unix line endings (`LF`) for all text files (via `.editorconfig`):

```.editorconfig
[*]
end_of_line = lf
```

So ideally, C# files (`.cs`) should also use `LF` as line ending type.

Unfortunately, this is currently not possible because Linux line endings are not *fully* supported by Visual Studio and ReSharper (my primary editors for C# code).

Without *full* support, when editing C# files you'd sometimes get Linux line endings (as defined by `.editorconfig`) and sometimes Windows line endings (for features that don't support Linux line endings or `.editorconfig`) - resulting in files with **mixed line endings**.

In other editors (like Visual Studio Code) this would not be a problem because they **normalize the line endings** when saving a file. Unfortunately, Visual Studio does *not* do this (see [feature request](https://developercommunity.visualstudio.com/idea/1296741/normalize-line-endings-on-save-according-to-editor.html) which has since been closed *without* actually fixing the problem).

So, for now, the pragmatic approach is to **define line endings for C# files as `CRLF`** (Windows line endings):

```.editorconfig
[*.cs]
end_of_line = crlf
```

> [!TIP]
> To prevent users from accidentally checking in mixed line endings, you should also enforce line endings via `.gitattributes`:
>
> ```.gitattributes
> *.cs text eol=crlf
> ```

## Bugs

This section tracks the various bug reports regarding missing Linux line ending support.

### Visual Studio

None known.

### ReSharper

* [RSRP-478837: Mixed line endings in file templates](https://youtrack.jetbrains.com/issue/RSRP-478837)
* [RSRP-494722: Code insertion (templates) creates wrong line endings](https://youtrack.jetbrains.com/issue/RSRP-494722)
