---
title: IDisposable, Finalizer, and SuppressFinalize in C# and C++/CLI
date: 2012-01-16T09:39:00+01:00
topics:
- dotnet
- csharp
- cpp-cli
draft: true
---

The .NET framework features an interface called [[http://msdn.microsoft.com/library/system.idisposable.aspx|IDisposable]]. It basically exists to allow freeing unmanaged resources (think: C++ pointers). In most cases, you won't need `IDisposable` when writing C# code. There are some exceptions though, and it becomes more important when writing C++/CLI code.

The [[http://msdn.microsoft.com/library/system.idisposable.aspx|help page]] for `IDisposable` provides the code for `IDisposable`'s default implementation pattern in C#. This article will explain each part of it step by step and also provide the equivalent C++/CLI code in each step.

<!--more-->

= Summary - for the impatient =
Here's the summary of this article for those who don't want to read the actual explanations.

Rules:
 * For a class owning //managed// resources, implement `IDisposable` (but not a finalizer).
 * For a class owning at least one //unmanaged// resource, implement both `IDisposable` and a finalizer.

C# code:

```c#
class DataContainer : IDisposable {
  public void Dispose() {
    Dipose(true);
    GC.SuppressFinalizer(this);
  }

  ~DataContainer() { // finalizer
    Dispose(false);
  }

  protected virtual void Dispose(bool disposing) {
    if (m_isDisposed)
      return;

    if (disposing) {
      // Dispose managed data
      //m_managedData.Dispose();
    }
    // Free unmanaged data
    //DataProvider.DeleteUnmanagedData(m_unmanagedData);
    m_isDisposed = true;
  }

  private bool m_disposed = false;
}
```

C++/CLI code:

```c++/cli
ref class DataContainer {
public:
  ~DataContainer() {
    if (m_isDisposed)
       return;

    // dispose managed data
    //delete m_managedData;
    this->!DataContainer(); // call finalizer
    m_isDisposed = true;
  }

  // Finalizer
  !DataContainer() {
    // free unmanaged data
    //DataProvider::DeleteUnmanagedData(m_unmanagedData);
  }

private:
  bool m_isDisposed; // must be set to false
};
```

= The Root of all Evil =
In C#, all classes are managed by the garbage collector. However, some things just can't be expressed in pure managed code. In these cases you'll need to store //unmanaged// data in a managed class. Examples are file handles, sockets, or objects created by unmanaged functions/frameworks.

So, here's an example of a C# class containing unmanaged data:

```c# highlight=3,6
class DataContainer {
  public DataContainer() {
    m_unmanagedData = DataProvider.CreateUnmanagedData();
  }

  private IntPtr m_unmanagedData;
}
```

The equivalent C++/CLI example would look like this:

```c++/cli highlight=4,8
ref class DataContainer {
public:
  DataContainer() {
    m_unmanagedData = DataProvider::CreateUnmanagedData();
  }

private:
  IntPtr m_unmanagedData;
};
```

The question now is: **When gets the unmanaged data deleted?**

= Finalizer =
Since our class `DataContainer` is a managed class, it is managed by .NET's garbage collector. When the garbage collector determines that our instance of `DataContainer` is no longer needed, the object's //finalizer// is called. So, that's are good point to delete our unmanaged data.

//Note:// Finalizers are also called //non-deterministic// destructors because the programmer has no influence over //when// the garbage collector will call the finalizer (once the object went out of scope). For //deterministic// destructors (explained in the next section), on the other hand, the programmer has full control when they are called.

In C# the finalizer method (internally named `Finalize()`) is created by using C++'s destructor notation (`~DataContainer`):

```c# highlight=6,7,8
class DataContainer {
  public DataContainer() {
    m_unmanagedData = DataProvider.CreateUnmanagedData();
  }

  ~DataContainer() {
    DataProvider.DeleteUnmanagedData(m_unmanagedData);
  }

  private IntPtr m_unmanagedData;
}
```

In C++/CLI the notation `~DataContainer()` is already reserved for deterministic destructors (because //all// destructors are deterministic in C++). So, here we must use the notation `!DataContainer` instead:

```c++/cli highlight=7,8,9
ref class DataContainer {
public:
  DataContainer() {
    m_unmanagedData = DataProvider::CreateUnmanagedData();
  }

  !DataContainer() {
    DataProvider.DeleteUnmanagedData(m_unmanagedData);
  }

private:
  IntPtr m_unmanagedData;
};
```

//Note:// Although you can declare a finalizer public in C++/CLI, it won't be. So, don't bother with its visibility. (In C# you get a compiler error when specifying anything but private visibility for the finalizer.)


= IDisposable =
Since finalizers are non-deterministic, you have no control over when they will be called. When working with unmanaged data it may, however, be desirable to control the point of time when this unmanaged data will be deleted. The easiest way to do this: create a method for that.

The .NET framework provides a standard name for this method: `Dispose()`, defined by the `IDisposable` interface. This method is also called a "//deterministic// destructor" (whereas finalizers are non-deterministic destructors). Here's the implementation in C#:

```c# highlight=1,6,7,8,9,10,11,12
class DataContainer : IDisposable {
  public DataContainer() {
    m_unmanagedData = DataProvider.CreateUnmanagedData();
  }

  public void Dispose() {
    if (m_isDisposed)
       return;

    DataProvider.DeleteUnmanagedData(m_unmanagedData);
    m_isDisposed = true;
  }

  private bool m_sDisposed= false;
  private IntPtr m_unmanagedData;
}
```

In C# you can either call the `Dispose()` method directly or use a `using` block. Note that we've added `m_isDisposed` to prevent the programmer from calling `Dispose()` multiple times.

In C++/CLI the `Dispose()` method is automatically created (and `IDisposable` is implemented) when creating a destructor (`~DataContainer`):

```c++/cli highlight=7,8,9,10,11,12,13
ref class DataContainer {
public:
  DataContainer() : m_isDisposed(false) {
    m_unmanagedData = DataProvider::CreateUnmanagedData();
  }

  ~DataContainer() {
    if (m_isDisposed)
       return;

    DataProvider::DeleteUnmanagedData(m_unmanagedData);
    m_isDisposed = true;
  }

private:
  bool m_isDisposed;
  IntPtr m_unmanagedData;
};
```

In C++/CLI a deterministic destructor (or the `Dispose()` method) is called automatically when:

 * a class instance is on the stack (instead of the managed heap) and goes out of scope
 * a class instance is on the managed heap and gets deleted via `delete myVar;`

This is identical with how you would "call" destructors in C++.

= Combining Dispose and Finalizer =
Since the programmer can forget to call `Dispose()`, it's important to free unmanaged data in the finalizer (as well) to avoid memory leaks. So, often you want to combine `Dispose()` and the finalizer. Here's how.

In C#, simply call `Dispose()` from the finalizer. Note that the finalizer will be called in any case, so the unmanaged data is freed even if the programmer forgets to call `Dispose()`.

```c# highlight=15
class DataContainer : IDisposable {
  public DataContainer() {
    m_unmanagedData = DataProvider.CreateUnmanagedData();
  }

  public void Dispose() {
    if (m_isDisposed)
      return;

    DataProvider.DeleteUnmanagedData(m_unmanagedData);
    m_isDisposed = true;
  }

  // Finalizer
  ~DataContainer() {
    Dispose();
  }

  private bool m_disposed = false;
  private IntPtr m_unmanagedData;
}
```

In C++/CLI we do the opposite: we call the finalizer (which isn't possible in C#). This way is the cleaner. I'll explain this a little later on.

```c++/cli highlight=11
ref class DataContainer {
public:
  DataContainer() : m_isDisposed(false) {
    m_unmanagedData = DataProvider::CreateUnmanagedData();
  }

  ~DataContainer() {
    if (m_isDisposed)
       return;

    this->!DataContainer();
    m_isDisposed = true;
  }

  // Finalizer
  !DataContainer() {
    DataProvider::DeleteUnmanagedData(m_unmanagedData);
  }

private:
  bool m_isDisposed;
  IntPtr m_unmanagedData;
};
```

= Managed Data ===================
Beside //unmanaged// data, a managed class can also contain //managed// data, i.e. instances of managed classes implementing `IDisposable`. Managed data is different from unmanaged data in that it should be disposed in `Dispose()` but //not// in the finalizer. This is because instances of managed classes may already have been garbage collected when the finalizer runs.

To avoid code duplication, `Dispose()` and the finalizer should be implemented like this (in pseudo-code):

```c++
void Dispose() {
  DisposeAllManagedData();
  Finalizer();
}

void Finalizer() {
  FreeAllUnmanagedData();
}
```

This is why I called the C++/CLI way the "cleaner" way above. It implements the whole thing just like our pseudo-code:

```c++/cli highlight=9,10
ref class DataContainer {
public:
   ...

  ~DataContainer() {
    if (m_isDisposed)
       return;

    delete m_managedData; // dispose managed data
    this->!DataContainer(); // call finalizer
    m_isDisposed = true;
  }

  // Finalizer
  !DataContainer() {
    DataProvider::DeleteUnmanagedData(m_unmanagedData); // free unmanaged data
  }

private:
  bool m_isDisposed;
  IntPtr m_unmanagedData;
  IDisposable^ m_managedData;
};
```

In C#, on the other hand, we can't call the finalizer. So, we need to add a helper method called `Dispose(bool)`:

```c# highlight=5,9,12
class DataContainer : IDisposable {
  ...

  public void Dispose() {
    Dipose(true);
  }

  ~DataContainer() {
    Dispose(false);
  }

  protected virtual void Dispose(bool disposing) {
    if (m_isDisposed)
      return;

    if (disposing) {
      m_managedData.Dispose();
    }
    DataProvider.DeleteUnmanagedData(m_unmanagedData);
    m_isDisposed = true;
  }

  private bool m_disposed = false;
  private IntPtr m_unmanagedData;
  private IDisposable m_managedData;
}
```

//Note:// The method `Dispose(bool)` is `virtual`. The idea behind this is that child classes can override this method to perform their own disposing. See below for more information. Note also that the C++/CLI compiler automatically creates this method when a class has a destructor. You can't, however, use this method directly. It's only visible from C# (or Visual Basic).

= SuppressFinalize ===================================
The default dispose implementation pattern (as shown in [[http://msdn.microsoft.com/library/system.idisposable.aspx|IDisposable's help page]]) also adds the line `GC.SuppressFinalize(this);` to the `Dispose()` method. What does this method do and why do we need it?

`GC.SuppressFinalize()` simply prevents the finalizer from being called. Since the finalizer's only task is to free unmanaged data, it doesn't need to be called if `Dispose()` was already called (and already freed all unmanaged data by calling the finalizer). Using `GC.SuppressFinalize()` give a small performance improvement but nothing more.

In C# the `Dispose()` method changes like this:

```c# highlight=3
  public void Dispose() {
    Dipose(true);
    GC.SuppressFinalize(this);
  }
```

In C++/CLI the destructor doesn't change //at all//. That's because the C++/CLI compiler automatically adds this code line to the destructor. (You can read about this and see a decompiled destructor [[http://www.codeproject.com/KB/mcpp/cppclidtors.aspx|here]]. Search for "SuppressFinalize".)

```c++/cli highlight=8
  ~DataContainer() {
    if (m_isDisposed)
       return;

    delete m_managedData; // dispose managed data
    this->!DataContainer(); // call finalizer
    m_isDisposed = true;
    // GC.SuppressFinalize(this) is automatically inserted here
  }
```

= Inheritance ==========================
The default dispose implementation pattern used in the previous sections create a method called `Dispose(bool)`. This method is `protected virtual` and is meant to be overridden by child classes - in case they need to dispose some data of their own.

In C#, an implementation must

 # first check whether it already has been disposed,
 # then dispose everything,
 # and then call the base method.

The base method is called last to ensure that child classes are disposed before their parent classes. This is how destructors work in C++ and `Dispose()` mimics this behavior.

```c# highlight=12
  protected virtual void Dispose(bool disposing) {
    if (m_isDisposed)
      return;

    if (disposing) {
      m_managedData.Dispose();
    }
    DataProvider.DeleteUnmanagedData(m_unmanagedData);
    m_isDisposed = true;

    // Dispose parent classes after child classes
    base.Dispose(disposing);
  }
```

//Note:// Each child class must manage its //own// `m_isDisposed` field.

In C++/CLI, again, the destructor remains the same. This is because it mimics the C++ destructor's behavior which automatically calls its parent destructor.

```c++/cli highlight=9
  ~DataContainer() {
    if (m_isDisposed)
       return;

    delete m_managedData; // dispose managed data
    this->!DataContainer(); // call finalizer
    m_isDisposed = true;
    // GC.SuppressFinalize(this) is automatically inserted here
    // Base destructor is automatically called here
  }
```

= When to Use IDisposable: 3 easy rules ===========
At this point I'd like to cite three easy rules when to use `IDisposable`. These rules were created by [[http://nitoprograms.blogspot.com/2009/08/how-to-implement-idisposable-and.html|Stephen Cleary]] and I take no credit for them. I do, however, disagree with some statements (such as "No classes should be responsible for multiple unmanaged resources.") and have adopted the rules in this case (see the link for the original description).

**Rule 1: Don't do it (unless you need to).**

There are only two situations when `IDisposable` does need to be implemented:

 * The class owns unmanaged resources.
 * The class owns managed (`IDisposable`) resources.

<b>Rule 2: For a class owning //managed// resources, implement IDisposable (but not a finalizer)</b>

This implementation of `IDisposable` should only call `Dispose()` for each owned resource. It should not set anything to `null`.

The class should not have a finalizer.

**Rule 3: For a class owning at least one //unmanaged// resource, implement both IDisposable and a finalizer**

The finalizer should free the unmanaged resource, `Dispose` should dispose any managed resource and then call the finalizer.

%% Article is to be imported by CodeProject
<a href="http://www.codeproject.com/script/Articles/BlogFeedList.aspx?amid=274673" rel="tag" style="display:none">CodeProject</a>
