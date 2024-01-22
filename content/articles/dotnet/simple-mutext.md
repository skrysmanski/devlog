---
title: SimpleMutex in .NET
date: 2015-02-05
topics:
- dotnet
---

The [Mutex](https://msdn.microsoft.com/library/system.threading.mutex.aspx) class in .NET is a little bit tricky to use.

Here's an example how I got it to do what I want:

```c#
/// <summary>
/// A simple, cross application mutex. Use <see cref="Acquire"/> to acquire it
/// and release it via <see cref="Dispose"/> when you're finished.
/// </summary>
/// <remarks>
/// Only one thread (and thus process) can have the mutex acquired at the same
/// time.
/// </remarks>
public class SimpleMutex : IDisposable
{
    private readonly Mutex m_mutex;

    /// <summary>
    /// Acquires the mutex with the specified name.
    /// </summary>
    /// <param name="mutexName">the mutex's name</param>
    /// <param name="timeout">how long to try to acquire the mutex</param>
    /// <returns>Returns the mutex or <c>null</c>, if the mutex couldn't be
    /// acquire in time (i.e. the current mutex holder didn't release it in
    /// time).</returns>
    public static SimpleMutex Acquire(string mutexName, TimeSpan timeout)
    {
        var mutex = new SimpleMutex(mutexName);
        try
        {
            if (!mutex.m_mutex.WaitOne(timeout))
            {
                // We could not acquire the mutex in time.
                mutex.m_mutex.Dispose();
                return null;
            }
        }
        catch (AbandonedMutexException ex)
        {
            // We now own this mutex. The previous owner didn't
            // release it properly, though.
            Trace.WriteLine(ex);
        }

        return mutex;
    }

    private SimpleMutex(string mutexName)
    {
        this.m_mutex = new Mutex(false, mutexName);
    }

    public void Dispose()
    {
        this.m_mutex.ReleaseMutex();
        this.m_mutex.Dispose();
    }
}
```

You can use it like this:

```c#
using (SimpleMutex.Acquire("MyTestMutex", Timeout.InfiniteTimeSpan))
{
    Console.WriteLine("Acquired mutex");
    Console.ReadKey();
}

Console.WriteLine("Released mutex");
```

If you run your program twice, one will acquire the mutex and the other one will wait - until you press a key in the first one.

```note
If you forget to call `Dispose()` on this mutex, the operating system will make sure that the mutex is released when the program terminates. However, the next process trying to acquire this mutex will then get an `AbandonedMutexException` (which is handled properly in `Acquire()` though).
```
