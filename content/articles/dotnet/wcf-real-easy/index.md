---
title: 'WCF: Real Easy'
date: 2013-07-08T22:32:00+01:00
topics:
- dotnet
- wcf
- networking
draft: true
---

If you search for WCF tutorials, you'll find a lot of elaborate examples that involve editing several files.

This tutorial is (supposed to be) different. It uses the simple most approach I could find for using WCF. It'll only involve one file and no XML descriptors (read: `app.config`).

I'll explain how to use WCF for **communicating between .NET processes** and how to use it for **HTTP requests**.

The initial code is based primarily on [this nice tutorial](http://weblogs.asp.net/ralfw/archive/2007/04/14/a-truely-simple-example-to-get-started-with-wcf.aspx).

Let's get started.

<!--more-->

## Preparation

For this tutorial, simply create a **console application** project.

You need to target at least **.NET 3.5**.

You also need to add references to **System.ServiceModel** and (for later) **System.ServiceModel.Web**.

In your `Program.cs`, we will use the following usings:

```c#
using System;
using System.ServiceModel;
using System.ServiceModel.Description;
using System.ServiceModel.Web;
using System.Threading;
```

You can remove everything else in this file - except for the `namespace`.

## The Service Interface

The first thing we need is a service interface (also called "service contract").

Add the following code to your `Program.cs`:

```c#
[ServiceContract]
public interface IService {
  // Returns "Hello, name" to the user.
  [OperationContract]
  string Ping(string name);
}
```

This interface will be implemented on the server side and used on the client side. So usually you'll place it in a shared project.

## The Service Implementation

Next, we're going to implement this interface on the server side.

Add the following code to your `Program.cs`:

```c#
// Implementation of IService
[ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
class ServiceImplementation : IService {
  public string Ping(string name) {
    Console.WriteLine("SERVER - Processing Ping('{0}')", name);
    return "Hello, " + name;
  }
}
```

The setting `InstanceContextMode.PerCall` will create a new instance of `ServiceImplementation` for every call. Of course, other settings are possible as well.


## The Server

For the service to be able to respond to request, it needs to be executed in a so called **service host**.

Add the following code to your `Program.cs`:

```c#
class Server {
  private readonly ManualResetEvent m_stopFlag = new ManualResetEvent(false);
  private readonly Thread m_serverThread;

  public Server() {
    this.m_serverThread = new Thread(this.Run);
    this.m_serverThread.IsBackground = true;
  }

  public void Start() {
    this.m_serverThread.Start();
    Thread.Sleep(1000); // wait for server to start up
  }

  public void Stop() {
    this.m_stopFlag.Set();
    this.m_serverThread.Join();
  }

  private void Run() {
    var svh = new ServiceHost(typeof (ServiceImplementation));
    svh.AddServiceEndpoint(typeof(IService), new NetTcpBinding(), "net.tcp://localhost:8000");
    svh.Open();

    Console.WriteLine("SERVER - Running...");
    this.m_stopFlag.WaitOne();

    Console.WriteLine("SERVER - Shutting down...");
    svh.Close();

    Console.WriteLine("SERVER - Shut down!");
  }
}
```

The important code here is in `Run()`.

First, we create an instance of [ServiceHost](http:*msdn.microsoft.com/library/ms554652.aspx) and pass the service *implementation// to it.

Next, we add an endpoint for the host (i.e. where the client will connect to). Here we specified the service *interface* because the service implementation could implement multiple services.

Last, we start the service host with `Open()`.

## The Client

Only one thing remains: the client.

Add the following code to your `Program.cs`:

```c#
internal class Program {
  private static void Main() {
    Console.WriteLine("WCF Simple Demo");

    // start server
    var server = new Server();
    server.Start();

    // run client
    using (var scf = new ChannelFactory<IService>(new NetTcpBinding(), "net.tcp://localhost:8000")) {
      IService s = scf.CreateChannel();

      while (true) {
        Console.Write("CLIENT - Name: ");

        string name = Console.ReadLine();
        if (string.IsNullOrEmpty(name)) {
          break;
        }

        string response = s.Ping(name);
        Console.WriteLine("CLIENT - Response from service: " + response);
      }

      ((ICommunicationObject)s).Close();
    }

    // shutdown server
    server.Stop();
  }
}
```

A couple of things are happening here.

First, we create and start the server. It runs on a different thread.

Then, we open a channel to our service by using `ChannelFactory` and `CreateChannel()`.

The instance returned by `CreateChannel()` can then be used to communicate with the server.

## WCF HTTP Service

It's also easy to accept HTTP requests with WCF.

First, you need to add `[WebGet]` (GET) or `[WebInvoke]` (POST) to the methods of `IService` you want to be "web-callable".

For example, change the implementation of `IService` to this:

```c# {hl_lines="4"}
[ServiceContract]
public interface IService {
  // Returns "Hello, name" to the user.
  [WebGet(ResponseFormat = WebMessageFormat.Json)]
  [OperationContract]
  string Ping(string name);
}
```

Note the added `[WebGet]` attribute. We also specified that the return value will be converted to JSON. The default is to return it as XML.

We don't need to change `ServiceImplementation` at all.

So, next we'll modify `Server.Run()`. Add the following code just after `svh.Open();`

```c#
var wsh = new WebServiceHost(typeof(ServiceImplementation), new Uri("http://localhost:8080"));
wsh.AddServiceEndpoint(typeof(IService), new WebHttpBinding(), "");

// Define debug properties
ServiceDebugBehavior sdb = wsh.Description.Behaviors.Find<ServiceDebugBehavior>();
sdb.HttpHelpPageEnabled = false;
sdb.IncludeExceptionDetailInFaults = true;

wsh.Open();
```

You just need to create a `WebServiceHost` - similar to how you created the `ServiceHost` before.

Note that `svh` and `wsh` use different ports.

After starting the app, you can call `Ping()` by going to:

<http://localhost:8080/Ping?name=Sebastian>

## Download The Code

You can get the complete code here:

  [](Program.cs)
