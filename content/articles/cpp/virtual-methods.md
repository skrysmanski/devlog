---
title: C++ and virtual methods (for C# or Java programmers)
date: 2011-04-18T10:53:00+01:00
topics:
- cpp
- oop
---

[[[TOC]]]
Last friday I stumbled over a seroius shortcomming of C++ (compared to C# or Java) I'd like to share here with you. It's about ##virtual## methods called from a class constructor.

= The C&#35; Example =
Let me start with an example. Here's some C# code that simply calls a ##virtual## method (named ##test()##) from the class' constructor:

{{{ lang="csharp"
class TestBaseClass {
  public TestBaseClass() {
    Console.Write("From base class: ");
    test();
  }

  protected virtual void test() {
    Console.WriteLine("in base class");
  }
}
}}}

Creating an instance of this class results in nothing special:

{{{
From base class: in base class
}}}

Now lets create a sub class of ##TestBaseClass## and override the ##virtual## method:

{{{ lang="csharp"
class TestSubClass : TestBaseClass {
  public TestSubClass() {
    Console.Write("From sub class: ");
    test();
  }

  protected override void test() {
    Console.WriteLine("in sub class");
  }
}
}}}

Now, creating an instance of ##TestSubClass## will print this:

{{{
From base class: in sub class
From sub class: in sub class
}}}

This means that the sub class' implementation of ##test()## was executed (and not ##TestBaseClass##' implementation) - just as expected.

**Note:** In Java all methods are automatically ##virtual##. In contrast to C# or C++ you can't create "non-virtual" methods in Java.

= The C++ Problem =
And exactly here is **the problem** in C++. Let's create a C++ version of the two classes above (compiled with Visual C++).

Header file (##TestClass.h##):
{{{ lang="cpp"
#pragma once

class TestBaseClass {
public:
  TestBaseClass();

protected:
  virtual void test();
};


class TestSubClass : public TestBaseClass {
public:
  TestSubClass();

protected:
  virtual void test();
};
}}}

Source file (##TestClass.cpp##):
{{{ lang="cpp"
#include "TestClass.h"
#include <stdio.h>

TestBaseClass::TestBaseClass() {
  printf("From base class: ");
  test();
}

void TestBaseClass::test() {
  printf("in base class\n");
}


TestSubClass::TestSubClass() : TestBaseClass() {
  printf("From sub class: ");
  test();
}

void TestSubClass::test() {
  printf("in sub class\n");
}
}}}

Now, creating an instance of ##TestSubClass## results in the following output:

{{{
From base class: in base class
From sub class: in sub class
}}}

Note how the //base class' implementation// of ##test()## is used in the base class constructor while the //sub class' implementation// of ##test()## is used in the sub class constructor.

The problem here (in constrast to C# or Java) is that the sub class constructor hasn't been executed yet and therefore the "redirection" from ##TestBaseClass::test()## to ##TestSubClass::test()## hasn't been established yet.

  **Rule: There is //no way// to call a sub class' implementation of a virtual function in the base class constructor!**

The problem becomes even more severe with **pure virtual** (which is ##abstract## in C# and Java) methods. These methods don't even have an implementation in the base class and therefore can't be executed at all.

**For your interest:** A //C++/CLI// class will behave like a C# class (and not like a C++ class).

= Example Visual Studio Solution =
I've created a solution (for Visual Studio 2010) containing the source code above. In addition to a C# and a C++ project, I've also added a C++/CLI project. You can download it here:

[[file:VirtualMethodTest.zip]]
