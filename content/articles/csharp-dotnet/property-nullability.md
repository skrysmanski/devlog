---
title: Separate nullability with C# properties
description: "[C#] How to define a different nullability for getter and setter of a property."
topics:
- csharp
- dotnet
- nullability
---

This article shows how to define a different nullability for the getter and setter of a property in C#.

## Summary

If you don't want to read the article:

```c#
public class MyClass
{
    // getter: not null
    // setter: can be null
    [NotNull]
    public string? SectionName
    {
        get => _sectionName ?? "DefaultSection";
        set => _sectionName = value;
    }

    private string? _sectionName;

    // getter: can be null
    // setter: not null
    [DisallowNull]
    public string? ExplicitName
    {
        get => _explicitName;
        set => _explicitName = value ?? throw new ArgumentNullException();
    }

    private string? _explicitName;
}
```

## Details

Normally, the getter and the setter of a property have identical nullability ("not null" or "can be null") - as defined by the property's type.

But sometimes you may want to have a different nullability for getter or setter:

1. The getter never returns `null` whereas the setter accepts `null` as value.
1. The getter can return `null` but the setter doesn't accept `null`.

### [NotNull]

For **option 1**, add `[NotNull]` to the property:

```c#
// getter: not null
// setter: can be null
[NotNull]
public string? SectionName
{
    get => _sectionName ?? "DefaultSection";
    set => _sectionName = value;
}

private string? _sectionName;
```

The [description of `[NotNull]`](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.notnullattribute) is:

> Specifies that an output is not `null` even if the corresponding type allows it.

### [DisallowNull]

For **option 2**, add `[DisallowNull]` to the property:

```c#
// getter: can be null
// setter: not null
[DisallowNull]
public string? ExplicitName
{
    get => _explicitName;
    set => _explicitName = value ?? throw new ArgumentNullException();
}

private string? _explicitName;
```

The [description of `[DisallowNull]`](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.codeanalysis.disallownullattribute) is:

> Specifies that `null` is disallowed as an input even if the corresponding type allows it.

### Value Types

These attributes also work for value types:

```c#
public class MyClass
{
    [NotNull]
    public int? BufferSize
    {
        get => _bufferSize ?? 4096;
        set => _bufferSize = value;
    }

    private int? _bufferSize;

    [DisallowNull]
    public int? ExplicitAge
    {
        get => _explicitAge;
        set => _explicitAge = value ?? throw new ArgumentNullException();
    }

    private int? _explicitAge;
}
```
