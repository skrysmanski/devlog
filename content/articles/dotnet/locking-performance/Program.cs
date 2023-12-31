using System;
using System.Diagnostics;
using System.Threading;

namespace LockingTests {
  class Program {
    private const long TEST_DURATION_MS = 10000;
    private const int BATCH_COUNT = 10000;

    static void Main() {

      Program prog = new Program();
      Stopwatch stopwatch = Stopwatch.StartNew();

      while (stopwatch.ElapsedMilliseconds < TEST_DURATION_MS) {
        for (var x = 0; x < BATCH_COUNT; x++) {
          prog.CallNoLock();
        }
      }
      stopwatch.Stop();

      Console.WriteLine("NoLock: {0:0,0} stmt/sec", prog.counter / stopwatch.Elapsed.TotalSeconds);


      prog.counter = 0;
      stopwatch = Stopwatch.StartNew();

      while (stopwatch.ElapsedMilliseconds < TEST_DURATION_MS) {
        for (var x = 0; x < BATCH_COUNT; x++) {
          prog.CallLocked();
        }
      }
      stopwatch.Stop();

      Console.WriteLine("Locked: {0:0,0} stmt/sec", prog.counter / stopwatch.Elapsed.TotalSeconds);

      prog.counter = 0;
      stopwatch = Stopwatch.StartNew();

      while (stopwatch.ElapsedMilliseconds < TEST_DURATION_MS) {
        for (var x = 0; x < BATCH_COUNT; x++) {
          prog.CallRWLockNonRecursive();
        }
      }
      stopwatch.Stop();

      Console.WriteLine("NoRec: {0:0,0} stmt/sec", prog.counter / stopwatch.Elapsed.TotalSeconds);

      prog.counter = 0;
      stopwatch = Stopwatch.StartNew();

      while (stopwatch.ElapsedMilliseconds < TEST_DURATION_MS) {
        for (var x = 0; x < BATCH_COUNT; x++) {
          prog.CallRWLockRecursive();
        }
      }
      stopwatch.Stop();

      Console.WriteLine("Recur: {0:0,0} stmt/sec", prog.counter / stopwatch.Elapsed.TotalSeconds);



      prog.counter = 0;
      stopwatch = Stopwatch.StartNew();

      while (stopwatch.ElapsedMilliseconds < TEST_DURATION_MS) {
        for (var x = 0; x < BATCH_COUNT; x++) {
          prog.CallSpinLock();
        }
      }
      stopwatch.Stop();

      Console.WriteLine("SpinLock: {0:0,0} stmt/sec", prog.counter / stopwatch.Elapsed.TotalSeconds);



      prog.counter = 0;
      stopwatch = Stopwatch.StartNew();

      while (stopwatch.ElapsedMilliseconds < TEST_DURATION_MS) {
        for (var x = 0; x < BATCH_COUNT; x++) {
          prog.CallInterlocked();
        }
      }
      stopwatch.Stop();

      Console.WriteLine("Interlocked: {0:0,0} stmt/sec", prog.counter / stopwatch.Elapsed.TotalSeconds);
    }

    private long counter = 0;

    private void CallLocked() {
      lock (this) {
        counter++;
      }
    }

    private void CallNoLock() {
      counter++;
    }

    private readonly ReaderWriterLockSlim m_lockRecursive = new ReaderWriterLockSlim(LockRecursionPolicy.SupportsRecursion);
    private readonly ReaderWriterLockSlim m_lockNonRecursive = new ReaderWriterLockSlim(LockRecursionPolicy.NoRecursion);

    private void CallRWLockRecursive() {
      this.m_lockRecursive.EnterReadLock();
      counter++;
      this.m_lockRecursive.ExitReadLock();
    }

    private void CallRWLockNonRecursive() {
      this.m_lockNonRecursive.EnterReadLock();
      counter++;
      this.m_lockNonRecursive.ExitReadLock();
    }

    private SpinLock m_spinLock = new SpinLock(enableThreadOwnerTracking: false);

    private void CallSpinLock() {
      bool lockTaken = false;
      try {
        this.m_spinLock.Enter(ref lockTaken);
        counter++;
      }
      finally {
        if (lockTaken) this.m_spinLock.Exit();
      }      
    }

    private void CallInterlocked() {
      long initialValue, computedValue;
      do {
        initialValue = this.counter;
        computedValue = initialValue + 1;
      } 
      while (initialValue != Interlocked.CompareExchange(ref this.counter, computedValue, initialValue));
    }
  }
}
