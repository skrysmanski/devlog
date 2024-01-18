---
title: Calculate return value for sort by int
date: 2013-01-17T13:55:00+01:00
topics:
- algorithms
- dotnet
- java
---

Most programming languages (such as C#, Java, ...) allow you to sort lists. Most of them also allow you to specify a *sorting function* so that you can customize the sort order. These functions usually take parameters `a` and `b` and define the return value as follows:

| Return value      | if                      |
| ----------------- | ------------------------|
| less than zero    | `a` is less than `b`    |
| equals zero       | `a` is equal to `b`     |
| greater than zero | `a` is greater than `b` |

Usually you would do something like this (code in C#):

```c#
int Compare(int a, int b) {
  if (a < b) {
    return -1;
  }
  else if (a > b) {
    return 1;
  }
  else {
    return 0;
  }
}
```

However, when comparing `int` values, there's a much quicker way to do this:

```c#
int Compare(int a, int b) {
  return a - b;
}
```

That's it.

```note
Care should be taken if `a` and/or `b` can come close to `int.MaxValue` or `int.MinValue`. In this case the results may not be what one wants (like if `a = int.MinValue` and `b = 1` then the result will be `int.MaxValue` which is wrong).
```
