---
title: C# and GC.KeepAlive()
date: 2013-08-08T13:40:00+01:00
topics:
- dotnet
draft: true
---

Today, while browsing some C++/CLI code, I stumbled upon several calls to ##GC.KeepAlive(someObj)##.

Immediately I thought **memory leak** - because I thought ##KeepAlive()## would keep the object alive indefinitely.

Fortunately, this turned out to be wrong, though.

After reading the [[http://msdn.microsoft.com/en-us/library/vstudio/system.gc.keepalive%28v=vs.110%29.aspx|documentation of GC.KeepAlive()]] (couldn't really figure it out), I did some decompiling and found out that ##GC.KeepAlive()## looks like this:

```c# line=1
[MethodImpl(MethodImplOptions.NoInlining)]
public static void KeepAlive(object obj)
{
}
```

It just does nothing. So what's its purpose?

**It's there to fake an access to a variable.**

Why? The .NET garbage collector may collect a variable directly after its last use - and not necessarily, contrary to common belief, at the end of the variable's scope.

Consider this code:

```c# line=1
class SomeClass
{
  // This field is initialized somewhere
  // in the constructor (not shown here).
  public SomeOtherClass Value;

  ...
}

...

void MyMethod()
{
  SomeClass obj = new SomeClass();
  SomeOtherMethod(obj.Value);
  YetAnotherMethod();
  // obj still alive here? Possibly not.
}
```

The garbage collector //may// collect ##obj## just after the runtime has retrieved ##obj.Value## (line 15), i.e. before ##SomeOtherMethod()## is even called.

//Note:// The exact line where ##obj## will be marked for collection is up to the JIT compiler. The behavior describe above seems to be called "lookahead optimization".

Usually this optimization not a problem. It becomes a problem, however, if ##SomeClass## has a finalizer:

```c# line=1
class SomeClass
{
  public SomeOtherClass Value;

  ~SomeClass()
  {
     // "Value" can't be used anymore
     // after Dispose() has been called.
     this.Value.Dispose();
  }
}
```

So, if ##obj##'s finalizer is executed before ##SomeOtherMethod()## is called, ##SomeOtherMethod()## won't be able to use ##obj.Value## anymore.

To solve this problem, add ##GC.KeepAlive()## after the call to ##SomeOtherMethod()##, like this (line 5):

```c# line=1
void MyMethod()
{
  SomeClass obj = new SomeClass();
  SomeOtherMethod(obj.Value);
  GC.KeepAlive(obj);
  YetAnotherMethod();
}
```

This way, the garbage collector won't collect ##obj## (and thus run its finalizer) before line 5 has been reached.

//Notes://
* The implementation of the finalizer of ##SomeClass## is flawed - as the examples in this article show. The user shouldn't need to worry about ##Value## being disposed too early.
** Rule of thumb: A finalizer should only dispose the resources of its //own// class, not resources of some member (by calling ##Dispose()## on members).
** The problem with the finalizer persists if ##Value## is an unmanaged resource/pointer that's being passed to ##SomeOtherMethod()##. This is always possible in C++/CLI. In C# ##Value## could be of type ##IntPtr##.
** In the examples above, consider implementing and using ##IDisposable## for ##SomeClass## instead of ##GC.KeepAlive()##, if you need a finalizer.
** You still need to use ##GC.KeepAlive()## if you can't change the implementation of ##SomeClass##.
* Using ##GC.KeepAlive()## is like using [[http://msdn.microsoft.com/library/system.runtime.interopservices.gchandle(v=vs.110).aspx|GCHandle]], just more light-weight and faster.
* ##GC.KeepAlive()## only works because it can't be inlined by the compiler (##MethodImplOptions.NoInlining##).


%% Article is to be imported by CodeProject
<a href="http://www.codeproject.com/script/Articles/BlogFeedList.aspx?amid=274673" rel="tag" style="display:none">CodeProject</a>