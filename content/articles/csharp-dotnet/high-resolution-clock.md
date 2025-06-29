---
title: High Resolution Clock in C#
date: 2014-07-02
topics:
- dotnet
aliases:
- /2014/07/02/high-resolution-clock-in-csharp/
- /2014/07/high-resolution-clock-in-csharp/
---

Clocks in computers have (among others) the following three properties: *accuracy*, *precision*, and *resolution*.

People generally agree on what's the difference between *accuracy* and *precision/resolution* but there seem to be lots of opinions on what's the difference between *precision* and *resolution* and which is which. So I'm going to shamelessly copy a [definition I found on Stack Overflow](http://stackoverflow.com/a/16740505/614177) that I'm agreeing with.

* **Precision:** the amount of information, i.e. the number of significant digits you report. (E.g. I'm 2m, 1.8m, 1.83m, 1.8322m tall. All those measurements are accurate, but increasingly precise.)
* **Accuracy:** the relation between the reported information and the truth. (E.g. "I'm 1.70m tall" is more precise than "1.8m", but not actually accurate.)
* **Resolution (or Granularity):** the smallest time interval that a clock can measure. For example, if you have 1 ms resolution, there's little point reporting the result with nanosecond precision, since the clock cannot possibly be accurate to that level of precision.

This article will be mainly about **resolution** (and precision and accuracy to some extend).

## DateTime

C# provides the `DateTime` type ([MSDN](http://msdn.microsoft.com/EN-US/library/system.datetime.aspx)) that allows to:

* store a certain point in time
* get the current date and time (via `Now` or `UtcNow`)

First, lets take a look at **precision**: The `DateTime` type is basically just a 64 bit integer that counts "ticks". One tick is 100 nanoseconds (or 0.0001 milliseconds) long ([MSDN](http://msdn.microsoft.com/EN-US/library/system.datetime.ticks.aspx)). So `DateTime`'s precision can be up to 0.0001 milliseconds.

Next, **resolution**. Basically, we're asking: "How long does it take for value of `DateTime.UtcNow` to change?" Lets find out.

The following C# code measures the resolution of `DateTime.UtcNow`:

```c#
Console.WriteLine("Running for 5 seconds...");

var distinctValues = new HashSet<DateTime>();
var sw = Stopwatch.StartNew();

while (sw.Elapsed.TotalSeconds < 5)
{
    distinctValues.Add(DateTime.UtcNow);
}

sw.Stop();

Console.WriteLine("Precision: {0:0.000000} ms ({1} samples)",
                  sw.Elapsed.TotalMilliseconds / distinctValues.Count,
                  distinctValues.Count);
```

This program records all the different values `DateTime.UtcNow` returns over the course of 5 seconds. This way, we know how often this value changes per second (or millisecond in this example) and that's the resolution.

According to [MSDN](http://msdn.microsoft.com/EN-US/library/system.datetime.utcnow.aspx) the resolution depends on the operating system but in my tests I found out that the resolution also seems to depend on the hardware (unless newer OS versions have a worse resolution).

| Machine  | OS           |  Resolution |
| -------- | ------------- | ---------- |
| Dev Box  | Windows 7 x64 | 1 ms       |
| Laptop   | Windows 8 x64 | 16 ms      |

## High Resolution Clock

On Windows 8 (or Windows Server 2012) or higher there's a new API that returns the current time with a much higher resolution:

[GetSystemTimePreciseAsFileTime()](http://msdn.microsoft.com/en-us/library/windows/desktop/hh706895%28v=vs.85%29.aspx)

Here's how to use it in C#:

```c#
using System;
using System.Runtime.InteropServices;

public static class HighResolutionDateTime
{
    public static bool IsAvailable { get; private set; }

    [DllImport("Kernel32.dll", CallingConvention = CallingConvention.Winapi)]
    private static extern void GetSystemTimePreciseAsFileTime(out long filetime);

    public static DateTime UtcNow
    {
        get
        {
            if (!IsAvailable)
            {
                throw new InvalidOperationException(
                    "High resolution clock isn't available.");
            }

            long filetime;
            GetSystemTimePreciseAsFileTime(out filetime);

            return DateTime.FromFileTimeUtc(filetime);
        }
    }

    static HighResolutionDateTime()
    {
        try
        {
            long filetime;
            GetSystemTimePreciseAsFileTime(out filetime);
            IsAvailable = true;
        }
        catch (EntryPointNotFoundException)
        {
            // Not running Windows 8 or higher.
            IsAvailable = false;
        }
    }
}
```

Using the same test code as above but using `HighResolutionDateTime.UtcNow` as input (instead of `DateTime.UtcNow`) leads to:

| Machine  | OS            | Resolution |
| -------- | ------------- | ---------- |
| Dev Box  | Windows 7 x64 | n/a        |
| Laptop   | Windows 8 x64 | 0.0004 ms  |

So, on my laptop the resolution increased by a factor of 40000.

> [!NOTE]
> The resolution can never be better/smaller than 0.0001 ms because this is the highest **precision** supported by `DateTime` (see above).

## Accuracy

To complete this article, lets also talk about **accuracy**.

`DateTime.UtcNow` and `HighResolutionDateTime.UtcNow` are both very **accurate**. The first one has lower **resolution**, the second one has higher **resolution**.

There's also `Stopwatch` in C#. `Stopwatch` has a high **resolution**. Using `Stopwatch.ElapsedTicks` as input for resolution measure code from above, I got these results:

| Machine  | OS            | Resolution |
| -------- | ------------- | ---------- |
| Dev Box  | Windows 7 x64 | 0.0004 ms  |
| Laptop   | Windows 8 x64 | 0.0004 ms  |

However, `Stopwatch` is not very accurate. On my laptop it drifts by 0.2 ms per second, i.e. it gets less accurate over time.

Here's how to measure the drift/accuracy loss:

```c#
var start = HighResolutionDateTime.UtcNow;
var sw = Stopwatch.StartNew();

while (sw.Elapsed.TotalSeconds < 10)
{
    DateTime nowBasedOnStopwatch = start + sw.Elapsed;
    TimeSpan diff = HighResolutionDateTime.UtcNow - nowBasedOnStopwatch;

    Console.WriteLine("Diff: {0:0.000} ms", diff.TotalMilliseconds);

    Thread.Sleep(1000);
}
```

This gives me an output like this:

```
Diff: 0,075 ms
Diff: 0,414 ms
Diff: 0,754 ms
Diff: 0,924 ms
Diff: 1,084 ms
Diff: 1,247 ms
Diff: 1,409 ms
Diff: 1,571 ms
Diff: 1,734 ms
Diff: 1,898 ms
```

As you can see, the difference increases over time. Thus, `Stopwatch` becomes less accurate over time.
