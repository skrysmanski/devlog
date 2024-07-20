---
title: Boxing Nullable Value Types in C#
description: "[C#] How GetType() behaves for boxed nullable value types."
topics:
- csharp
- dotnet
- boxing
---

A nullable value type value (e.g. `int?`) loses its nullability type information when it's boxed:

**Concrete value:**

```c#
int? valueType = 42;
object? boxed = valueType;
Console.WriteLine(boxed?.GetType()); // System.Int32
```

**Null value:**

```c#
int? valueType = null;
object? boxed = valueType;
Console.WriteLine(boxed is null); // true
```

This also means that using `Nullable.GetUnderlyingType()` is useless for boxed value types:

```c# {hl_lines="9"}
public void MyMethod(object? value)
{
    if (value is null)
    {
        return;
    }

    // Always false!
    bool isNullable = Nullable.GetUnderlyingType(value.GetType()) != null;
}
```

See also: <https://stackoverflow.com/a/3775643/614177>
