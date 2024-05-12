---
title: Boxing bool values
topics:
- csharp
- dotnet
- boxing
---

When boxing value types in C#/.NET, an object on the heap is created.

**What happens when you box a `bool` value?**

Since there are only two possible values, are the box objects reference equal?

The answer is: **No. For example, boxing `true` twice results in different objects.**

Consider this code:

```c#
var obj1 = (object)true;
var obj2 = (object)true;

Console.WriteLine(ReferenceEquals(obj1, obj2)); // prints "false"
```

There are not even {{< abbr "BCL" "Base Class Library" >}} constants for `true` and `false` (unlike Java). This issue is behavior is discussed in this [GitHub issue](https://github.com/dotnet/runtime/issues/47596).
