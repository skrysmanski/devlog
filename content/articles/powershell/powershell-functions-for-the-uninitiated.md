---
title: PowerShell functions for the uninitiated (C# developer)
date: 2013-03-18T13:27:00+01:00
topics:
- powershell
draft: true
---

Being a C# developer, I recently found some use for Microsoft's PowerShell (the `cmd` replacement). What's nice about PowerShell is that it has full access to the .NET framework.

However, there are also some very pit falls when coming from C# (or any related programming language).

There's one very mean pit fall when it comes to **functions and their return values** that - if you don't exactly know how PowerShell works - makes you pull out your hair.

<!--more-->

Assume this PowerShell code:

```powershell
function PrintAndReturnSomething {
  echo "Hello, World"
  return 42
}

$result = PrintAndReturnSomething
```

What do you expect `$result` to be? An integer with value `42`, right? Let's check it out.

We're adding the following line to the end of the script:

```powershell
echo ("Return type: " + $result.GetType().FullName)
```

Now, when you run the script, you'll get:

```
Return type: System.Object[]
```

**Wait, what? Where's the "Hello, World"? And why the heck is `$return` an object array?**

The first problem (pit fall) is that PowerShell treats every non-captured object (i.e. one that isn't assigned to a variable) as return value.

== Functions Return Everything That Isn't Captured =======
Let's have a look at a different script for a moment:

```powershell
function LongNumericString {
  $strBld = new-object System.Text.StringBuilder
  for ($i=0; $i -lt 20; $i++) {
    $strBld.Append($i)
  }
  return $strBld.ToString()
}
```

One would expect that `LongNumericString` returns just a string; but it doesn't. Instead it returns an `object[]` with this contents:

```
Capacity           MaxCapacity                        Length
â€”â€”â€“                â€”â€”â€”â€“                               â€”â€”
16                 2147483647                         1
16                 2147483647                         2
16                 2147483647                         3
16                 2147483647                         4
16                 2147483647                         5
16                 2147483647                         6
16                 2147483647                         7
16                 2147483647                         8
16                 2147483647                         9
16                 2147483647                        10
16                 2147483647                        12
16                 2147483647                        14
16                 2147483647                        16
32                 2147483647                        18
32                 2147483647                        20
32                 2147483647                        22
32                 2147483647                        24
32                 2147483647                        26
32                 2147483647                        28
32                 2147483647                        30
012345678910111213141516171819
```

The problem here is that `$strBld.Append` returns a `StringBuilder` object. And since this return value isn't assigned to a variable, PowerShell considers it part of the return value.

To resolve this problem, prefix `$strBld.Append` with `[void]`:

```powershell highlight=4
function LongNumericString {
  $strBld = new-object System.Text.StringBuilder
  for ($i=0; $i -lt 20; $i++) {
    [void]$strBld.Append($i)
  }
  return $strBld.ToString()
}
```

**Note:** The keyword `return` is totally optional. The expression `return $strBld.ToString()` is equivalent to `$strBld.ToString()`, and even to `$strBld.ToString(); return`.

== Function Return Values = Function Output ======
Back to our initial script. Now that we know how PowerShell composes return values for functions, why didn't `PrintAndReturnSomething` return just `42`?

One needs to understand that **PowerShell doesn't actually care about return value but rather about output of functions**. The return value is just considered to be //a part// of the output. This way, PowerShell doesn't just allow you to pipe text (like `ls -l | sort` in bash), but to [pipe actual objects](http://technet.microsoft.com/en-us/library/ee176927.aspx).

For example, `Get-ChildItem C:\ | Format-Table Name, Length` is the same as:

```powershell
$child_items = Get-ChildItem C:\
Format-Table -InputObject $child_items Name, Length
```

`PrintAndReturnSomething` uses `echo` (which is an alias for `Write-Output`) to print "Hello, World". This is output and thus part of the function's return value.

To force PowerShell to write something to the console (rather than including it in the return value), use `Write-Host` instead of `echo`.

The corrected code is:

```powershell highlight=2
function PrintAndReturnSomething {
  Write-Host "Hello, World"
  return 42
}

$result = PrintAndReturnSomething
# Return is now a "System.Int32" with value 42.
```

== Summary ======
To sum things up:

 * PowerShell functions will always return (as `object[]`, if there's more than one return value):
 ** all uncaptured objects (i.e. objects that haven't been assigned to variables)
 ** as well as all output (from `echo`/`Write-Output`)
 * Exclude from return value:
 ** Uncaptured objects: prefix with `[void]`
 ** Console output: use `Write-Host` instead of `echo`/`Write-Output`
