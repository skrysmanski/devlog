---
title: The Visitor Pattern Explained
date: 2013-05-06T21:11:00+01:00
topics:
- algorithms
- design-patterns
- oop
draft: true
---

In my last job interview I got a (rather vague) question about traversing a tree and operating on the tree nodes. I think I've a lot of experience in programming but I couldn't figure out the answer on my own. The answer the guy wanted to hear was: **visitor pattern**.

I had never heard of it before. So, in preparation for my next job interview, I thought I take a look at it.

While trying to figure it out, I stumbled over this quote:

>The Visitor pattern is possibly the most complicated design pattern you will face. ([Source](http://www.jquantlib.org/index.php/A_better_implementation_of_Visitor_pattern))

I totally agree. (And this is probably why I've never heard or used it before.)

But since I'm not a quitter I went on and tamed it. So, in this article I'm going to shed some light on this mysterious design pattern.

<!--more-->

== Definition ==
The main problem (in my opinion) with the visitor pattern is that it's often not really clear what it does. So, let's start with the following definition (based on [[wiki:en|Visitor pattern|Wikipedia]]):

> The visitor design pattern is a way of //separating an operation from an object structure// on which it operates. [...] In essence, this pattern allows one to //add new virtual functions// to a family of classes without modifying the classes themselves;

== Motivation ==
Let's explore what this means. I'll provide some basic examples with increasing complexity to illustrate the motivation behind the visitor pattern.

//Note:// All examples are in C#.

=== The Object Structure === #object_structure
The definition above states that the visitor pattern separates "an operation from an //object structure//". So, let's define this object structure.

Assume we have some kind of wikicode parser. The wikicode allows us to write documents in plain text but enrich them with some formatting (bold text) and hyperlinks.

So, we have classes for plain text, bold text, and hyperlinks:

```c#
public abstract class DocumentPart {
  public string Text { get; private set; }
}

public class PlainText : DocumentPart { }

public class BoldText : DocumentPart { }

public class Hyperlink : DocumentPart {
  public string Url { get; private set; }
}
```

And we have a document class:

```c#
public class Document {
  private List<DocumentPart> m_parts;
}
```


=== Scenario 1: Converting Into HTML ===
Now let's assume we want to convert this document into HTML.

The most straightforward way would be to add a `virtual` method called `ToHTML()` to `DocumentPart`, like this:

```c#
public abstract class DocumentPart {
  public string Text { get; private set; }
  public abstract string ToHTML();
}

public class PlainText : DocumentPart {
  public override string ToHTML() {
    return this.Text;
  }
}

public class BoldText : DocumentPart {
  public override string ToHTML() {
    return "<b>" + this.Text + "</b>";
  }
}

public class Hyperlink : DocumentPart {
  public string Url { get; private set; }

  public override string ToHTML() {
    return "<a href=\"" + this.Url + "\">" + this.Text + "</a>";
  }
}
```

And the `Document` class would also get a `ToHTML()` method:

```c#
public class Document {
  private List<DocumentPart> m_parts;

  public string ToHTML() {
    string output = "";
    foreach (DocumentPart part in this.m_parts) {
      output += part.ToHTML();
    }
    return output;
  }
}
```

Then, by calling `Document.ToHTML()` one could convert the whole document into HTML.

=== Scenario 2: Different Output Formats ===
Let's add some complexity. Additionally to the previous scenario, we now also want to allow the conversion into plain text and LaTeX.

A naive way would be to provide implementations for each output format:

```c#
public abstract class DocumentPart {
  public string Text { get; private set; }
  public abstract string ToHTML();
  public abstract string ToPlainText();
  public abstract string ToLatex();
}

public class PlainText : DocumentPart {
  public override string ToHTML() {
    return this.Text;
  }
  public override string ToPlainText() {
    return this.Text;
  }
  public override string ToLatex() {
    return this.Text;
  }
}

public class BoldText : DocumentPart {
  public override string ToHTML() {
    return "<b>" + this.Text + "</b>";
  }
  public override string ToPlainText() {
    return "**" + this.Text + "**";
  }
  public override string ToLatex() {
    return "\\textbf{" + this.Text + "}";
  }
}

public class Hyperlink : DocumentPart {
  public string Url { get; private set; }

  public override string ToHTML() {
    return "<a href=\"" + this.Url + "\">" + this.Text + "</a>";
  }
  public override string ToPlainText() {
    return this.Text + " [" + this.Url + "]";
  }
  public override string ToLatex() {
    return "\\href{" + this.Url + "}{" + this.Text + "}";
  }
}

public class Document {
  private List<DocumentPart> m_parts;

  public string ToHTML() {
    string output = "";
    foreach (DocumentPart part in this.m_parts) {
      output += part.ToHTML();
    }
    return output;
  }

  public string ToPlainText() {
    string output = "";
    foreach (DocumentPart part in this.m_parts) {
      output += part.ToPlainText();
    }
    return output;
  }

  public string ToLatex() {
    string output = "";
    foreach (DocumentPart part in this.m_parts) {
      output += part.ToLatex();
    }
    return output;
  }
}
```

This implementation suffers two major problems:

 * The code for the `Document.To...()` methods is almost identical. This may lead to errors when changing one of the methods but forgetting to update the others.
 * Each document part needs to know every possible output format.

These problems can be solved with the **visitor pattern**.

== The Visitor Pattern ==
The visitor pattern consists of two parts:

* a method called `Visit()` which is implemented by the **visitor** and is called for every element in the data structure
* **visitable** classes providing `Accept()` methods that accept a visitor

=== Visitor: Convert To HTML ===
Let's start with the **visitor**. As example, we're going to implement the "convert to html" operation.

For this, we need to define an interface called `IVisitor`:

```c#
public interface IVisitor {
  void Visit(PlainText docPart);
  void Visit(BoldText docPart);
  void Visit(Hyperlink docPart);
}
```

Then we implement to HTML conversion:

```c#
public class HtmlVisitor : IVisitor {
  public string Output {
    get { return this.m_output; }
  }
  private string m_output = "";

  public void Visit(PlainText docPart) {
    this.Output += docPart.Text;
  }

  public void Visit(BoldText docPart) {
    this.m_output += "<b>" + docPart.Text + "</b>";
  }

  public void Visit(Hyperlink docPart) {
    this.m_output += "<a href=\"" + docPart.Url + "\">" + docPart.Text + "</a>";
  }
}
```

=== Visitable: The Document Structure ===
By applying the visitor pattern to our document classes, they change to this:

```c# highlight=3,7,8,9,13,14,15,21,22,23,29,30,31,32,33
public abstract class DocumentPart {
  public string Text { get; private set; }
  public abstract void Accept(IVisitor visitor);
}

public class PlainText : DocumentPart {
  public override void Accept(IVisitor visitor) {
    visitor.Visit(this);
  }
}

public class BoldText : DocumentPart {
  public override void Accept(IVisitor visitor) {
    visitor.Visit(this);
  }
}

public class Hyperlink : DocumentPart {
  public string Url { get; private set; }

  public override void Accept(IVisitor visitor) {
    visitor.Visit(this);
  }
}

public class Document {
  private List<DocumentPart> m_parts;

  public void Accept(IVisitor visitor) {
    foreach (DocumentPart part in this.m_parts) {
      part.Accept(visitor);
    }
  }
}
```

//Note:// The implementations of `Accept()` seem to be identical for all child classes of `DocumentPart`. However, we can't move the code into the base class because `IVisitor` doesn't have an method `Visit(DocumentPart)` but only for the concrete implementations. (We could solve this through reflection, though, but would lose compile-time checking.)

=== Putting It All Together ===
Now, to convert a document to HTML we can use this code:

```c#
Document doc = ...;
HtmlVisitor visitor = new HtmlVisitor();
doc.Accept(visitor);
Console.WriteLine("Html:\n" + visitor.Output);
```

To convert the document into LaTeX, we'd need to implement a `LatexVisitor`:

```c#
public class LatexVisitor : IVisitor {
  public string Output {
    get { return this.m_output; }
  }
  private string m_output = "";

  public void Visit(PlainText docPart) {
    this.m_output += docPart.Text;
  }

  public void Visit(BoldText docPart) {
    this.m_output += "\\textbf{" + docPart.Text + "}";
  }

  public void Visit(Hyperlink docPart) {
    this.m_output += "\\href{" + docPart.Url + "}{" + docPart.Text + "}";
  }
}
```

The implementation of the actual document classes remain unchanged.

//Side note:// If you're wondering whether `Accept` is a good name or whether the method should be renamed (e.g. to `Convert`): Check whether operations other than conversions are possible. For example, one could implement a `BoldTextCountVisitor` or a `UrlExtractorVisitor`. If such operations are possible, you should stick with the name `Accept` - as this communicates that the visitor pattern is being used here.


== The Actual Problem Being Solved ==
If you're not into theory, you can skip this part. It explains the formal problem the visitor pattern solves: something called **double dispatch**.

Now, what's that?

=== Single Dispatch ===
Most (all?) OOP programming languages support **single dispatch**, more commonly known as **virtual methods**. For example, consider the following code:

```c#
public class SpaceShip {
  public virtual string GetShipType() {
    return "SpaceShip";
  }
}

public class ApolloSpacecraft : SpaceShip {
  public override string GetShipType() {
    return "ApolloSpacecraft";
  }
}
```

Now, execute this code:

```c#
SpaceShip ship = new ApolloSpacecraft();
Console.WriteLine(ship.GetShipType());
```

This will print "ApolloSpacecraft". The actual method implementation to be called is chosen **at runtime** based solely on the actual type of `ship`. So, only the type of a //single// object is used to select the method, hence the name //single// dispatch.

//Note:// "Single dispatch" is one form of "dynamic dispatch", i.e. the method is chosen at runtime. If the method is chosen at compile time (true for all non-virtual methods), it's called "static dispatch".

=== Double Dispatch ===
Let's add some asteroids:

```c#
public class Asteroid {
  public virtual void CollideWith(SpaceShip ship) {
    Console.WriteLine("Asteroid hit a SpaceShip");
  }
  public virtual void CollideWith(ApolloSpacecraft ship) {
    Console.WriteLine("Asteroid hit an ApolloSpacecraft");
  }
};

public class ExplodingAsteroid : Asteroid {
  public override void CollideWith(SpaceShip ship) {
    Console.WriteLine("ExplodingAsteroid hit a SpaceShip");
  }
  public override void CollideWith(ApolloSpacecraft ship) {
    Console.WriteLine("ExplodingAsteroid hit an ApolloSpacecraft");
  }
};
```

With this, let's execute some more code. With:

```c#
Asteroid theAsteroid = new Asteroid();
ExplodingAsteroid theExplodingAsteroid = new ExplodingAsteroid();
SpaceShip theSpaceShip = new SpaceShip();
ApolloSpacecraft theApolloSpacecraft = new ApolloSpacecraft();
```

this code:

```c#
theAsteroid.CollideWith(theSpaceShip);
theAsteroid.CollideWith(theApolloSpacecraft);
theExplodingAsteroid.CollideWith(theSpaceShip);
theExplodingAsteroid.CollideWith(theApolloSpacecraft);
```

will print:

```
Asteroid hit a SpaceShip
Asteroid hit an ApolloSpacecraft
ExplodingAsteroid hit a SpaceShip
ExplodingAsteroid hit an ApolloSpacecraft
```

Everything is as expected. Now, consider this code:

```c#
// Note the different data types!
Asteroid theExplodingAsteroidRef = new ExplodingAsteroid();
SpaceShip theApolloSpacecraftRef = new ApolloSpacecraft();
theExplodingAsteroidRef.CollideWith(theApolloSpacecraftRef);
```

The desired result here would be "ExplodingAsteroid hit an //ApolloSpacecraft//" but instead we get "ExplodingAsteroid hit a //SpaceShip//".

The problem is that C# (and Java, C++, ...) only supports single dispatch, but not double dispatch. The method chosen is **only** based on `theExplodingAsteroidRef`, but not on `theExplodingAsteroidRef` **and** `theApolloSpacecraftRef` (which would be double dispatch).

== Not Actually Solved Problem: Iterators ==
Many pages on the internet associate the visitor pattern with traversing some data structure, usually a tree or hierarchy.

This got me totally confused because at first I couldn't figure out **what's the difference between the visitor pattern and the iterator pattern**.

The point here is: The main goal of the visitor pattern is to solve the double dispatch problem. Solving the iterator pattern is only a byproduct. If you're just looking for a way to iterate a data structure, the iterator pattern may be a better alternative instead.

Suppose you have this class:

```c#
// List of ints
public class MyList : IVisitable, IEnumerable {
  private List<int> m_list;
  public Enumerator GetEnumerator() { ... } // iterator pattern
  public void Accept(IVisitor visitor) { ... } // visitor pattern
}
```

Now, you want to calculate the sum of all integers in the list.

You can do this either by using the **iterator pattern**:

```c#
IEnumerable myList = new MyList(...);

int sum = 0;
foreach (int value in myList) {
  sum += value;
}

Console.WriteLine("Sum: " + sum);
```

Or you can do this by using the **visitor pattern**:

```c#
IVisitable myList = new MyList(...);

IVisitor visitor = new SumVisitor();
myList.Accept(visitor);

Console.WriteLine("Sum: " + visitor.Sum);
```

== Issues ==
There are some issues (or problems) with the visitor pattern.

=== Iteration Order ===
One problem is the iteration order.

For example, if you define a visitor pattern on a tree, the iteration may be depth-first or breadth-first.

So, if you have some operation (visitor) that requires a certain iteration order, you //may// have a problem.

For example, you could implement the visitor pattern for saving a data structure to disk where each visitor represents a different file format. This would allow you to easily add new file formats later. However, this only works as long as all file formats store the data **in the same order**. If two formats require different orders, this pattern doesn't work anymore.

=== New Visitables ===
If you add new visitable, you need to update every visitor that's already implemented.

Let's take our document classes from [[#object_structure|above]]. We had the classes `PlainText`, `BoldText`, and `Hyperlink`.

Now, let's say we want to add a class for underlined text. The interface `IVisitor` would thus change to:

```c#
public interface IVisitor {
  void Visit(PlainText docPart);
  void Visit(BoldText docPart);
  void Visit(Hyperlink docPart);
  void Visit(UnderlinedText docPart); // added
}
```

Due to this change we would also need to update all visitors we've already implemented. We could use reflection to solve (or just hide) the problem but in the end the visitor pattern **works best on data structures that don't change**.

=== Access to Private Members ===
There's another issue when the visitors need access to private data of the visitables.

To stick with the visitor pattern, you may be force to make this data public, even though it's not supposed to be public, thereby breaking the principle of information hiding.

== Summary ==
The visitor pattern is a relatively complicated pattern.

**Design goal:** Separate operations from the data structures they work on. As a nice side effect, this allows you to add operations to data structures that you can't change (maybe because you lost the source code for them).

**You need:**
* `IVisitor` (the operation) providing a `Visit()` method for each visitable class; needs to be implemented by every visitor.
* `IVisitable` providing an `Accept(Visitor)` method; needs to be implemented by every visitable class.

**Issues:**
* Difference to iterator pattern sometimes a little fuzzy.
* Iteration order can't be controlled.
* Adding or removing visitables requires you to update all visitors.
* Visitor implementations may be in conflict with the principle of information hiding.

**Real world examples:**
* Converting a data structure into different output formats. Compilers are a good example for this.
* Implementing drawing code for some scene graph/map structure on different platforms (e.g. OpenGL vs. DirectX).


%% Article is to be imported by CodeProject
<a href="http://www.codeproject.com/script/Articles/BlogFeedList.aspx?amid=274673" rel="tag" style="display:none">CodeProject</a>
