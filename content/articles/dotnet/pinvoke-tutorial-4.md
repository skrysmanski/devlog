---
title: 'P/Invoke Tutorial: Pinning (Part 4)'
date: 2012-06-11T15:26:00+01:00
topics:
- dotnet
- cpp
- pinvoke
draft: true
---

Sometimes a C/C++ function needs to store data you pass to it for //later reference//. If such data is a managed object (like a ##string## or ##class##) you need to make sure that the garbage collector doesn't delete it while it's still used/stored in the native code.

That's what //pinning// is for. It prevents the garbage collector from deleting //and// moving the object.

<!--more-->

= Pinning an Object ================
To pin a managed object, use ##GCHandle.Alloc()##:

```c#
// Pin "objectToBePinned"
GCHandle handle = GCHandle.Alloc(objectToBePinned, GCHandleType.Pinned);
```

The ##objectToBePinned## remains pinned until you call ##Free()## on the handle:

```c#
// Unpin "objectToBePinned"
handle.Free();
```

After unpinning the object it can again be:

 * moved by the garbage collector (to optimize memory layout)
 * deleted, if no more references exist to it

//Notes://
 * ##Free()## will never be called automatically. If you don't call it manually, the memory of the pinned object will never be freed (i.e. you create a memory leak).
 * You only need to pin //objects// (including strings). You can't pin primitive types (like ##int##) and //structs//, as they reside on the stack and are passed by copy. If you try pin a ##struct##, a //copy// of the struct will be pinned.
 * Classes and structs must have the attribute ##[StructLayout(LayoutKind.Sequential)]## to control the layout of their fields. Otherwise ##GCHandle.Alloc()## will throw an ##ArgumentException## reading: "Object contains non-primitive or non-blittable data."
 * If the method you're calling doesn't store a reference to the passed object for later reference, you don't need to pin this object. P/Invoke automatically pins objects before the C/C++ function is called and unpins them after the function has returned. So, manually pinning an object is actually about the (time of) unpinning.

Note also that you don't need (and actually can't) pin **delegates**. You need, however, to extend the lifetime of the delegate for as long as it can be called from unmanaged code. To cite an [[http://blogs.msdn.com/b/cbrumme/archive/2003/05/06/51385.aspx|MSDN blog entry]] on this:

>Along the same lines, managed Delegates can be marshaled to unmanaged code, where they are exposed as unmanaged function pointers. Calls on those pointers will perform an unmanaged to managed transition; a change in calling convention; entry into the correct ##AppDomain##; and any necessary argument marshaling.  Clearly the unmanaged function pointer must refer to a fixed address. It would be a disaster if the GC were relocating that!  This leads many applications to create a pinning handle for the delegate. This is completely unnecessary.  The unmanaged function pointer actually refers to a native code stub that we dynamically generate to perform the transition & marshaling.  This stub exists in fixed memory outside of the GC heap.
>
> However, the application **is** responsible for somehow extending the lifetime of the delegate until no more calls will occur from unmanaged code. The lifetime of the native code stub is directly related to the lifetime of the delegate.  Once the delegate is collected, subsequent calls via the unmanaged function pointer will crash or otherwise corrupt the process.

= Passing a Pinned Object =============
Now that you've pinned your object you surely want to pass it to a C/C++ function.

The easiest way to do this is to specify managed type directly on the P/Invoke method:

```c#
// Directly using "MyType" as parameter type
[DllImport("NativeLib")]
private static extern void do_something(MyType myType);
```

Then call this method:

```c#
GCHandle handle = GCHandle.Alloc(objectToBePinned, GCHandleType.Pinned);

do_something(objectToBePinned);

// NOTE: Usually you wouldn't free the handle here if "do_something()"
//   stored the pointer to "objectToBePinned".
handle.Free();
```

The alternative is to pass it as ##IntPtr## (although it's no different from the direct approach):

```c# highlight=2,8
[DllImport("NativeLib")]
private static extern void do_something(IntPtr myType);

...

GCHandle handle = GCHandle.Alloc(objectToBePinned, GCHandleType.Pinned);

do_something(handle.AddrOfPinnedObject());

// NOTE: Usually you wouldn't free the handle here if "do_something()"
//   stored the pointer to "objectToBePinned".
handle.Free();
```


= Pinning and Passing Strings ======= #pinning-strings
Pinning strings is the same as pinning objects with one exception:

  **You must specify the ##CharSet.Unicode##. when passing pinned strings!**

Otherwise P/Invoke will convert the string into an ASCII string (thereby copying it).

Assume this C function:

```c++
void do_something(void* str1, void* str2) {
  // Check whether the pointers point to the same address
  printf("Equals: %s\n", (str1 == str2 ? "true" : "false"));
}
```

Then:

```c#
// WRONG! Will print "false"
[DllImport("NativeLib", EntryPoint="do_something")]
private static extern void do_something1(string str1, IntPtr str2);

// CORRECT! Will print "true"
[DllImport("NativeLib", CharSet = CharSet.Unicode, EntryPoint="do_something")]
private static extern void do_something2(string str1, IntPtr str2);

...

string text = "my text";
GCHandle handle = GCHandle.Alloc(text, GCHandleType.Pinned);

// Will print "false"
do_something1(text, handle.AddrOfPinnedObject());
// Will print "true"
do_something2(text, handle.AddrOfPinnedObject());
```

= Verifying the Pinned Object is passed =============
As mentioned in the previous section P/Invoke //may// create a copy of an object instead of passing it by reference directly.

You can easily verify this by comparing the pointer adresses. In C# use `handle.AddrOfPinnedObject().ToString()` to obtain the address of the pinned object.


%% Article is to be imported by CodeProject
<a href="http://www.codeproject.com/script/Articles/BlogFeedList.aspx?amid=274673" rel="tag" style="display:none">CodeProject</a>
