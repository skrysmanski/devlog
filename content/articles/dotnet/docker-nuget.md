---
title: Docker, .NET Core and (NuGet) Dependencies
date: 2016-08-13T16:00:00+01:00
topics:
- dotnet
- nuget
- docker
draft: true
---

Recently, I wanted to try out the new [[https://www.microsoft.com/net/core|.NET Core]] together with a [[https://www.docker.com/|Docker]] container. However, coming from programing .NET applications for the regular .NET Framework, there were some obstacles I encountered. This one is about NuGet packages.

<!--more-->

[[[TOC]]]

== The Goal ==
The goal is to have a .NET Core console application with some NuGet dependencies running in a Docker container.

I'll be using Visual Studio 2015 ([[https://www.visualstudio.com/|Community Edition]]) for this article but you also use any other IDE that supports .NET Core projects. As such, I'll try to minimize the dependency on Visual Studio in this article.

To better understand how a .NET Core application integrates with Docker, I will **not** use the [[https://aka.ms/DockerToolsForVS|Docker Tools for Visual Studio]]. While they work, they add a lot of "magic" to the build process. And this magic makes it hard to understand what's going on.

== Download the Example Code == #example-code
To keep the article brief, I'll just explain the important parts.

You can find the complete source code on my GitHub:

  https://github.com/skrysmanski/dotnetcore-docker

Note that you can examine the [[https://github.com/skrysmanski/dotnetcore-docker/commits/master|commits]] to see how the example evolves like this article.

== The Program ==
The program I'm going to write is very simple:

{{{ lang=c#
using System;
using Newtonsoft.Json;

namespace DockerCoreConsoleTest
{
    public class Program
    {
        public static void Main()
        {
            Console.WriteLine(
                $"Hello, Docker and {typeof(JsonConvert).FullName}!"
            );
        }
    }
}
}}}

It just uses .NET Core and the ##Newtonsoft.Json## NuGet package as dependency.

== Building with Visual Studio ==
Building the application in Visual Studio is pretty straight forward.

# Make sure you have installed the [[https://www.microsoft.com/net/core#windows|.NET Core Visual Studio Tooling]] installed.
# Create a new **.NET Core Console Application** project/solution called <nobr>##DockerCoreConsoleTest##</nobr>.
# Use NuGet to add ##Newtonsoft.Json## to the project.
# Copy the code from above into your ##Program.cs##
# Run the program

You should see the following output:

{{{
Hello, Docker and Newtonsoft.Json.JsonConvert!
}}}

If you run into any troubles, go and checkout the [[#example-code|example code]].

== Running in Docker ==
So far, so good. Now lets execute this program in a Docker container.

**Note:** If you haven't installed Docker yet, you can download it [[https://www.docker.com/products/docker#/windows|here]].

For this, we'll use the following ##Dockerfile##:

{{{
FROM microsoft/dotnet:1.0.0-core
COPY bin/Debug/netcoreapp1.0/ /app/
WORKDIR /app
ENTRYPOINT ["dotnet", "DockerCoreConsoleTest.dll"]
}}}

Then build the Docker image with:

{{{
docker build -t dockercoreconsoletest .
}}}

Then run the Docker image with:

{{{
docker run dockercoreconsoletest
}}}

This will give you this result:

{{{
Error: assembly specified in the dependencies manifest was not found
-- package: 'Newtonsoft.Json', version: '9.0.1', path: 'lib/netstandard1.0/Newtonsoft.Json.dll'
}}}

Not what one would expect.

== The Problem(s) ==
The problem here is that - unlike .NET projects for the regular //.NET Framework// - the build process for a //.NET Core// project (##dotnet build##) does **not** copy any dependencies into the output folder.

If you look into ##bin\Debug\netcoreapp1.0## you'll find no ##Newtonsoft.Json.dll## file there.

There's a second problem (or more an inconvenience). The ##Dockerfile## contains the following line:

{{{
COPY bin/Debug/netcoreapp1.0/ /app/
}}}

This line depends on the build configuration that's being used. If you'd build a **Release** build, the ##Dockerfile## wouldn't work anymore.

== The Solution ==
In .NET Core projects you use the ##dotnet publish## command to gather all dependencies in one directory (default is ##bin/CONFIG/netcoreapp1.0/publish##).

So, running this command fixes the first problem. But it can also fix the second problem.

First, we can add the following lines to the project's ##project.json## file:

{{{ lang=json
"publishOptions": {
  "include": [
    "Dockerfile"
  ]
}
}}}

Now, when running ##dotnet publish##, the ##Dockerfile## will be copied to the publish directory as well.

This also means that we can change the ##COPY## directive in the ##Dockerfile## to:

{{{
COPY . /app/
}}}

This way, the ##Dockerfile## independent of the build configuration.

We could go one step further and actually build the docker image as part of the publish process. To do this, add the following lines to the project's ##project.json## file:

{{{ lang=json
"scripts": {
  "postpublish": [
    "docker build -t dockercoreconsoletest %publish:OutputPath%"
  ]
}
}}}

Two notes one this:
# I have not found a [[http://stackoverflow.com/a/36730997/614177|suitable]] variable (like ##%publish:OutputPath%##) yet that could be used for the docker label (##-t##). So, for the time being, the label has to be hard-coded here.
# Building a docker image as part of publish process may not be for everyone. I like the idea mainly because I haven't come across any (relevant) downsides of doing this.

== Wrapping Things Up ==
You can now run:

{{{
# dotnet publish
# docker run dockercoreconsoletest
}}}

This will give you the expected output:

{{{
Hello, Docker and Newtonsoft.Json.JsonConvert!
}}}

This is my first shot at Docker and .NET Core. If you find any error or have suggestions for improvements, please leave them in the comments below.

== Alternative Solution: Using dotnet:latest as base image ==
There's another solution to the problem(s) described in this article. This solution is less "clean", in my opinion, but I thought I mention it anyways.

In the ##Dockerfile##, instead of using ##microsoft/dotnet:1.0.0-core## as base image, one could use ##microsoft/dotnet:latest##. This will give the Docker container access to <nobr>##dotnet build##</nobr> (whereas the ##-core## base image just contains ##dotnet someapplication.dll##).

You may then build the .NET Core application from **within** the container with a ##Dockerfile## like this:

{{{
FROM microsoft/dotnet:latest
COPY . /app
WORKDIR /app

RUN ["dotnet", "restore"]
RUN ["dotnet", "build"]

ENTRYPOINT ["dotnet", "run"]
}}}

This approach has some disadvantages:
# The container in general will be bigger than the solution proposed in the rest of the article.
# You need to copy all source code into the container (and it will stay there).
#* Depending on how you execute ##docker build##, this container may even contain the build output of configurations that you don't intend to run (e.g. ##bin/Debug## when actually running a release build).
#* Removing the source code after building the application (or having lots of ##RUN## directives in general) may be inefficient in regard to Docker's container layering system and [[https://docs.docker.com/engine/userguide/eng-image/dockerfile_best-practices/#build-cache|Build Cache]].
# Running ##dotnet restore## will re-download all NuGet dependencies every time the container image is built. This will increase the build time and cause unnecessary network traffic - especially if the application is built often as part of some continuous integration process.
