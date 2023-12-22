---
title: Windows Performance Counter Types
date: 2013-11-20T19:35:00+01:00
topics:
- windows
- dotnet
draft: true
---

There are several types of performance counters in Windows. However, I had a hard time of understanding all these types just from their documentation. So I decided to compile some examples for each counter type.

I also wrote some C# code to demonstrate how to use performance counters. You'll find it at the end of this article.

<!--more-->

**Notes:**
* You can watch performance counters with the **Performance Monitor** (##perfmon##) that comes with Windows. However, it can't display negative values so some counters can't be monitored properly.
* I use the .NET names for performance counter types in this article.
* Categorization of the counter types follows the [[http://msdn.microsoft.com/EN-US/library/4bcx21aa.aspx|official documentation]].

== Terminology ==
; Performance counter : A counter to monitor performance of a running system (e.g. CPU usage). Is basically just an ##int##.
; Sampling, Measurement : Read the value of a performance counter (at a certain point in time)
; Sampling rate : How often a performance counter is sampled (e.g. every second)
; Time frame : Time between two samplings (usually one second)
; Monotonicity : Whether you can increase and/or decrease the value of a performance counter. (Some counters require you to always increase - but not decrease - their values.)

== Composite Counters==
Before we begin, a word about (what I call) "composite counters".

As the name suggests, these counters are composited of two counters - a parent counter and a base counter. Parent counters can be monitored, base counters cannot.

To register (new/custom) performance counters in Windows, you need to pass a list of performance counter creation data to [[http://msdn.microsoft.com/EN-US/library/440b32x1%28v=VS.110,d=hv.2%29.aspx|PerformanceCounterCategory.Create()]]. In this list the base counter data must come immediately after the parent counter data.

The following table lists which base counter type can be used with which parent counter type:

|= Base counter type   |= Parent (composite) counter types
| ##AverageBase##      | ##AverageTimer32##, ##AverageCount64##
| ##CounterMultiBase## | ##CounterMultiTimer##, ##CounterMultiTimerInverse##, ##CounterMultiTimer100Ns##, ##CounterMultiTimer100NsInverse##
| ##RawBase##          | ##RawFraction##
| ##SampleBase##       | ##SampleFraction##


== Instantaneous Counters ==
**Displays:** the most recent measurement

|= Types        | ##NumberOfItems32##, ##NumberOfItems64##, ##NumberOfItemsHEX32##, ##NumberOfItemsHEX64##
|= Description  | The simplest counter; just displays the raw number without any calculations; the ##HEX## variants indicate that the values should be displayed as hexadecimal (instead of decimal)
|= Example      | Overall database operations
|= Displays as  | raw count
|= Composite    | no
|= Monotonicity | increasing, decreasing, remain static
&nbsp;
|= Types        | ##RawFraction##
|= Description  | Used to display fractions (instead of integers like with ##NumberOfItems##); usually interpreted as percentage
|= Example      | Percentage of maximum allowed concurrent database connections; ##RawFraction##: current connection count; ##RawBase##: maximum connection count
|= Displays as  | ##(RawFraction / RawBase) * 100##
|= Composite    | yes (base: ##RawBase##)
|= Monotonicity | increasing, decreasing, remain static


== Average Counters ==
**Displays:** average of values during time frame

|= Types        | ##AverageCount64##
|= Description  | Used to describe how many items were processed per operation in average
|= Example      | Database operations per transaction; for each operation, you'd increment ##AverageCount64## and for each completed transaction you'd increment ##AverageBase##
|= Displays as  | average items per operation (during the last time frame)
|= Composite    | yes (##AverageBase##)
|= Monotonicity | increasing, ~~decreasing~~, remain static

; Note : The difference to ##RawFraction## is that ##RawFraction## would be displayed as the average since the creation/last reset of the counter, while ##AverageCount64## would be displayed as average during the last time frame (usually a second).

|= Types        | ##AverageTimer32##
|= Description  | Used to describe how long an operation takes in average
|= Example      | Average time each database transaction takes; for each transaction, you'd measure the execution time of the transaction with ##Stopwatch## and increment ##AverageTimer32## by ##Stopwatch.ElapsedTicks##; and for each completed transaction you'd increment ##AverageBase## by one
|= Displays as  | average time per operation (during the last time frame)
|= Composite    | yes (##AverageBase##)
|= Monotonicity | increasing, ~~decreasing~~, remain static
&nbsp;
|= Types        | ##CountPerTimeInterval32##, ##CountPerTimeInterval64##
|= Description  | Usually used to describe the average count of items in a queue; if you have 0 items at the beginning, and 10 items after 5 seconds, then the rate would be displayed as 2.
|= Example      | Monitoring a worker queue that contains jobs to run in the background
|= Displays as  | average count change per time frame
|= Composite    | no
|= Monotonicity | increasing, decreasing, remain static

; Note : I found the information about ##CountPerTimeInterval## somewhere on the internet. However, in my test I couldn't get it working properly. The values of this counter would display as extremely small in Performance Monitor; something like ##10.5E-06## - although it should be something like ##10.5##. Also Performance Monitor doesn't seem capable of displaying negative values. They are necessary however when the queue handles requests faster than new requests get placed into it.

|= Types        | ##SampleCounter##
|= Description  | Shows the average number of operations completed in one second (according to MSDN). Seems to be identical to ##RateOfCountsPerSecond## (see below).
|= Example      | Web requests served per second; for each served request, you would call ##Increment()## on the counter
|= Displays as  | average operation per second (during the last time frame)
|= Composite    | no
|= Monotonicity | increasing, ~~decreasing~~, remain static


== Rate Counters ==
**Displays:** rate of item count growth

|= Types        | ##RateOfCountsPerSecond32##, ##RateOfCountsPerSecond64##
|= Description  | Used to display how many items were - in average - processed per second during the last time frame. Seems to be identical to ##SampleCounter##.
|= Example      | Web requests served per second; for each served request, you would call ##Increment()## on the counter
|= Displays as  | average item per second (during the last time frame)
|= Composite    | no
|= Monotonicity | increasing, ~~decreasing~~, remain static


== Percentage (of Time) Counters ==
**Displays:** calculated values as a percentage

|= Types        | ##CounterTimer##, ##CounterTimerInverse##, ##Timer100Ns##, ##Timer100NsInverse##
|= Description  | Used to display the percent of time that a component is active (##CounterTimer##) or inactive (##CounterTimerInverse##).
|= Example      | % of time an operation is running; you'd measure the time the operation takes to execute and then increase the counter's value by this amount
|= Displays as  | % of time a component was active during the last second (or other time frame)
|= Composite    | no
|= Monotonicity | increasing, ~~decreasing~~, remain static

**Notes:**
* ##CounterTimerInverse## is like ##CounterTimer## but measures how long the component is inactive. So, you'd measure the time from when the component became inactive to the next time it becomes active and increase the counter's value by this amount.
* For ##CounterTimer## and ##CounterTimerInverse##, use ##Stopwatch.ElapsedTicks## as counter value. For ##Timer100Ns## and ##Timer100NsInverse##, use ##DateTime.Ticks## instead. (Note that these ticks have different lengths, as stated [[http://msdn.microsoft.com/EN-US/library/2d0zc00w.aspx|here]].)

|= Types        | ##CounterMultiTimer##, ##CounterMultiTimerInverse##, ##CounterMultiTimer100Ns##, ##CounterMultiTimer100NsInverse##
|= Description  | Work exactly as their non-multi counterparts (e.g. ##CounterTimer## for ##CounterMultiTimer##), except that the result is divided by ##CounterMultiBase##
|= Example      | % of time an operation is running, if multiple calls to the operation can run in parallel; you'd measure the time the operation takes to execute and then increase the counter's value by this amount; ##CounterMultiBase## would be set to the number of parallel operations
|= Displays as  | % of time a component was active during the last second (or other time frame)
|= Composite    | yes (##CounterMultiBase##)
|= Monotonicity | increasing, ~~decreasing~~, remain static

&nbsp;

|= Types        | ##SampleFraction##
|= Description  | Average ratio during the last time frame in percent
|= Example      | Average ratio (%) of successful operations during the last time frame; you would increment ##SampleBase## for every operation, and ##SampleFraction## for each successful one.
|= Displays as  | average ratio in %
|= Composite    | yes (##SampleBase##)
|= Monotonicity | increasing, ~~decreasing~~, remain static


== Difference Counters ==
**Displays:** difference between value at the beginning and the end of the time frame

|= Types        | ##CounterDelta32##, ##CounterDelta64##
|= Description  | Displays the difference between the raw value at the beginning and the end of the measured time frame
|= Example      | Anything you need to display as difference
|= Displays as  | difference
|= Composite    | no
|= Monotonicity | increasing, decreasing, remain static

; Note : Performance Monitor can't display negative values.

|= Types        | ##ElapsedTime##
|= Description  | Time in seconds since ~~the counter was created~~ sometime in the past. Note that you can't set the value of this counter manually; it automatically increases.
|= Example      | System up time
|= Displays as  | seconds
|= Composite    | no
|= Monotonicity | ~~increasing~~, ~~decreasing~~, ~~remain static~~

; Note : I have no clue what start time is chosen for the counter. It's certainly not the time the counter was created. In my example, where I created the counter just a couple of seconds ago, it already had a value of about 27 hours (was even longer than my system up time).


== Example Code ==
Here's an example project that demonstrates the various performance counters:

  [[file:PerformanceCounters.zip]] (15 KB)
