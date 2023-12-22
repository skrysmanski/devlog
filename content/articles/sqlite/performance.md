---
title: SQLite Performance
date: 2012-10-01T14:23:00+01:00
topics:
- sqlite
- performance
draft: true
---

I'm currently working on a [[https://bitbucket.org/mayastudios/sqlite.net|cross-platform SQLite .NET wrapper]]. At the moment it's not really thread-safe. So, I was looking for ways of making it thread-safe.

Basically, there are two ways to do this:

# Share a single connection among all threads and use .NET locking mechanisms.
# Let each thread have its own connection (thus no .NET locking would be required).

To be able to make this decision, I did some performance tests and - assuming I did them right - got some interesting results you can read after the break.

<!--more-->

= The Setup ======
The tests ran on a Notebook featuring an Intel Core 2 Duo (2.53 GHz) and 8 GB memory. The OS was Windows 7 x64.

There are 40 tests in the suite testing various combinations of the available test parameters (see below).

Each test was executed for 1 to 20 threads to test concurrency.

Each test for a certain thread count (1, 2, 3, ...) ran 30 seconds and was repeated 10 times.

Thus, the overall test duration was about 2 days.

In each test scenario, the SQLite database contained only one table with four columns. For ##SELECT## tests this table was filled with 50,000 rows of random data.

There are two kinds of concurrent access:

 * //Read access:// Simulated by repeatedly selecting a random row from the table and reading all four values.
 * //Write access:// Simulated by inserting random values into the table.

The first batch of tests simulated read access, the second batch simulated write access, and the third batch simulated both concurrently.

//Note:// In all tests, the CPU was the limiting factor - not the hard drive.

= Test Parameters =======
Each test comprises of a certain combination of the following test parameters:

 * //Shared connection vs. multi connection:// Whether all threads share the same database connection, or whether every thread has its own connection (to the same database though). Shared connections use ##SQLITE_OPEN_FULLMUTEX## (serialized), multi connections use ##SQLITE_OPEN_NOMUTEX## (multithread).
 * //Read-only:// Whether the connection is opened in read-only or read-write mode (##SQLITE_OPEN_READONLY##).
 * //Shared cache:// Whether all connections share the same cache (##SQLITE_OPEN_SHAREDCACHE##), or whether each connection has its own cache.
 * //WAL:// Whether the connection(s) use a database in [[http://www.sqlite.org/draft/wal.html|WAL (write-ahead logging) journal mode]].
 * //Filled table:// Whether the table to read from is empty or filled (not examined in this report due to missing data; I should mention though that trying to read from an empty table is significant slower than reading from a filled table).

= Batch 1: read tests ======
Let's start with the tests only reading data (i.e. no data is written during these tests). Each thread randomly reads a data row and then obtains all four values stored in it. This is repeated for 30 seconds.

[[file:select-statements.csv]] (file containing data for charts in this section)

== Test: read-only =======
First test is about whether opening a database connection in read-only mode (##SQLITE_OPEN_READONLY##) does result in any performance benefit.

<div style="text-align:center;padding-bottom:1em">
<span style="color:black">---</span> : read-write
<span style="color:red">---</span> : read-only
</div>
[[image:select-sh-con-read-only.png|center|medium|link=source]]
[[image:select-mul-con-read-only.png|center|medium|link=source]]

As you can see, there's no benefit from choosing a read-only connection over a read-write connection (but it doesn't hurt either).

== Test: shared cache ======
Next, let's check whether using a shared cache (##SQLITE_OPEN_SHAREDCACHE##) affects read performance.

<div style="text-align:center;padding-bottom:1em">
<span style="color:black">---</span>, <span style="color:gray">---</span> : no shared cache
<span style="color:red">---</span>, <span style="color:orange">---</span> : use shared cache
</div>
[[image:select-sh-con-shared-cache.png|center|medium|link=source]]
[[image:select-mul-con-shared-cache.png|center|medium|link=source]]

For a shared connection (first chart) you can clearly see that using a shared cache is never better than using a private cache. The same is true for multiple connection (second chart).

== Test: WAL ======
Next, we test the use of WAL (write-ahead logging). WAL is (suppose to be) bringing a performance benefit for concurrent write operations (which we don't have here).

<div style="text-align:center;padding-bottom:1em">
<span style="color:black">---</span> : no WAL
<span style="color:red">---</span>, <span style="color:green">---</span> : use WAL
</div>
[[image:select-sh-con-wal.png|center|medium|link=source]]
[[image:select-mul-con-wal.png|center|medium|link=source]]

As you can see, with few threads, using WAL for read operations results in a big performance boost (400% for shared connection, 700% for multi connections). However, when using a shared connection and more than 8 threads, WAL doesn't provide any performance benefit anymore (but it also doesn't hurt).

== Summary: read tests ======
Let's summarize what we've learned so far (for reading operations):

 * using a read-only connection doesn't provide any performance benefit
 * using a shared cache is never faster (but sometimes slower) than using a private cache
 * using WAL is always faster than using the default journal mode (DELETE)

As for the question whether to use a shared connection or multiple connections, see this chart:

<div style="text-align:center;padding-bottom:1em">
<span style="color:black">---</span> : one shared connection
<span style="color:red">---</span> : one connection per thread
</div>
[[image:select-result.png|center|medium|link=source]]

This chart only contains the variations for shared and multi connections with the best performance, i.e. using WAL and no shared cache. As you can see, for very few threads (my guess: thread count <= cpu count), multiple connections perform much better. However, for more threads, a single shared connection is the better choice.

= Batch 2: write tests ======
Next, let's look at write-only tests. With these tests, multiple threads concurrently write to the same database table, inserting random data.

[[file:insert-statements.csv]] (file containing data for charts in this section)

== Test: shared cache ======
Our first tests checks the performance for when a shared cache is used.

<div style="text-align:center;padding-bottom:1em">
<span style="color:black">---</span> : private cache
<span style="color:red">---</span> : shared cache
</div>
[[image:insert-sh-cache.png|center|medium|link=source]]

As you can see, there's no real difference between whether a shared cache or a private cache is used.

== Test: WAL ======
Next, let's check WAL (which improved read performance significantly even though it's designed for write operations).

<div style="text-align:center;padding-bottom:1em">
<span style="color:black">---</span> : no WAL
<span style="color:red">---</span> : use WAL
</div>
[[image:insert-wal.png|center|medium|link=source]]

As expected, using a database in WAL mode drastically improves write performance.

== Test: shared connections ======
The last thing to tests is whether to use multiple connections or a single shared one.

<div style="text-align:center;padding-bottom:1em">
<span style="color:black">---</span> : shared connection
<span style="color:red">---</span> : one connection per thread
</div>
[[image:insert-sh-con.png|center|medium|link=source]]

The results are clear. Using a shared connection always yields better write performance when using multiple threads.

== Summary: write tests =======
To summarize the previous sections:

 * Using a shared cache doesn't affect the performance.
 * Using WAL improves write performance significantly.
 * Using a shared connection is always faster than using multiple connections.

[[image:insert-results.png|center|medium|link=source]]

= Batch 3: mixed reads and writes test =====
The last batch combines the previous two batches. This time the same number of read and write threads read and write concurrently from/to the same database table.

[[file:mixed-statements.csv]] (file containing data for charts in this section)

== Assumption: WAL improves general performance =======
The previous tests clearly showed that enabling WAL improves read as well as write performance. Let's check whether this is still true for concurrent reads and writes.

<div style="text-align:center;padding-bottom:1em">
<span style="color:black">---</span> : no WAL
<span style="color:red">---</span> : use WAL
</div>
[[image:mixed-select-wal.png|center|medium|link=source]]
[[image:mixed-insert-wal.png|center|medium|link=source]]

Again, enabling WAL results in a significant performance boost.

//Note:// Reading without WAL is extremely slow (under 1000 rows per second for 10 threads or less).

== Test: Shared or multiple connections  ====
Next, check whether we should use a shared connection or multiple connections.

[[image:mixed-select-result.png|center|medium|link=source]]
[[image:mixed-insert-result.png|center|medium|link=source]]

As you can see, in both cases using one connection per threads and using WAL provides the best performance.

= Conclusions ========
Assuming, my code doesn't contain any errors that are affecting the results in a significant way, the following conclusions can be drawn:

 * Enabling WAL for a database gives a significant performance boost for all read and write operations.
 * If memory is not an issue, shared caches shouldn't be used as they may decrease read performance.
 * Using read-only connections doesn't affect the read performance.

Regarding shared connection vs. multiple connections:

 * If you only have one thread, it doesn't matter (obviously).
 * If you do primarily reading...
 ** ... and the thread count is <= the CPU (core) count: use multiple connections
 ** ... and you have more threads than CPUs (cores): use shared connection
 * If you do primarily writing, use a shared connection.
 * If you do about the same amount of reading and writing, use multiple connections.

I hope this helps. If there's something (terribly) wrong with this analysis, please leave a comment below.

Please note that these results are based on a Windows system. Other operating system may produce other results.