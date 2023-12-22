---
title: Rectangle Intersection Test (with C#)
date: 2011-05-11T13:44:00+01:00
topics:
- algorithms
- dotnet
draft: true
---

For a software project I needed to check whether two rectangles intersect (or overlap). What made my problem complicated was that one of the rectangles could be rotated. While this problem seems to be trivial (to a human being), it's not that simple to implement. It took me a while to find [[http://stackoverflow.com/questions/115426/algorithm-to-detect-intersection-of-two-rectangles|the right answer]].

[[image:intersecting-rectangles.png|center]]

Now, the solution to this problem is called a **separating axis test**. Basically this means: If I can find an axis (read: line) that separates both rectangles, then they don't intersect/overlap. (Actually this works for any convex polygon; see below) Of course, if the two rectangles don't intersect, there are undefinitely many possible separating axes. Fortunately we can use the edges of each rectangle as axes and testing all of the is sufficient.

[[image:separating-axis.png|center|An axis separating two rectangles]]

I won't get into the details of this algorithm here - it's sufficiently good described in the article mentioned above - but basically you check for each point on which side of the separating axis it is. If all points of the rectangle A are on one side and all of rectangle B are on the other side, then we've found a separating axis.

Here's the implementation of the method testing where a single edge (represented by points ##x1## and ##x2##) is a separating axis:

```c#
/// <summary>
/// Does axis separation test for a convex quadrilateral.
/// </summary>
/// <param name="x1">Defines together with x2 the edge of quad1 to be checked whether its a separating axis.</param>
/// <param name="x2">Defines together with x1 the edge of quad1 to be checked whether its a separating axis.</param>
/// <param name="x3">One of the remaining two points of quad1.</param>
/// <param name="otherQuadPoints">The four points of the other quad.</param>
/// <returns>Returns <c>true</c>, if the specified edge is a separating axis (and the quadrilaterals therefor don't
/// intersect). Returns <c>false</c>, if it's not a separating axis.</returns>
bool DoAxisSeparationTest(Point x1, Point x2, Point x3, Point[] otherQuadPoints) {
  Vector vec = x2 - x1;
  Vector rotated = new Vector(-vec.Y, vec.X);

  bool refSide = (rotated.X * (x3.X - x1.X)
                + rotated.Y * (x3.Y - x1.Y)) >= 0;

  foreach (Point pt in otherQuadPoints) {
    bool side = (rotated.X * (pt.X - x1.X)
               + rotated.Y * (pt.Y - x1.Y)) >= 0;
    if (side == refSide) {
      // At least one point of the other quad is one the same side as x3. Therefor the specified edge can't be a
      // separating axis anymore.
      return false;
    }
  }

  // All points of the other quad are on the other side of the edge. Therefor the edge is a separating axis and
  // the quads don't intersect.
  return true;
}
```

This method is then called for each edge of each rectangle. If the method returns ##true##, the actual intersection test method can return "not intersecting". If the method returns ##false## for all edges, the rectangles intersect.

[[image:test-app.png|center|medium|link=source]]

I've created an C#/WPF example implementation (under FreeBSD license) that you can download and experiment with.

  <big>[[file:RectangleIntersectionTest.zip|Rectangle Intersection Test Project]] (for Visual Studio 2010)</big>

//Remarks:// The algorithm above works for every convex polygon. Instead of four times two edges you then have n times m edges. For concave polygons, however, this algorithm doesn't work because there may be no separating axis even though the polygons don't intersect.
