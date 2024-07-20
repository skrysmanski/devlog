using System;
using System.ServiceModel;
using System.ServiceModel.Description;
using System.ServiceModel.Web;
using System.Threading;

namespace WcfTest {

  public class MyClass {
    public string MyString { get; set; }
    public int MyInt { get; set; }
  }

  [ServiceContract]
  public interface IService {
    [OperationContract]
    [WebGet(ResponseFormat = WebMessageFormat.Json)]
    string Ping(string name);

    [OperationContract]
    [WebGet(ResponseFormat = WebMessageFormat.Json)]
    MyClass GetData();
  }


  [ServiceBehavior(InstanceContextMode = InstanceContextMode.PerCall)]
  internal class ServiceImplementation : IService {
    public string Ping(string name) {
      Console.WriteLine("SERVER - Processing Ping('{0}')", name);
      return "Hello, " + name;
    }

    public MyClass GetData() {
      return new MyClass() { MyString = "Magrathea", MyInt = 42 };
    }
  }

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

      var wsh = new WebServiceHost(typeof(ServiceImplementation), new Uri("http://localhost:8080"));
      wsh.AddServiceEndpoint(typeof(IService), new WebHttpBinding(), "");
      
      // Define debug properties
      ServiceDebugBehavior sdb = wsh.Description.Behaviors.Find<ServiceDebugBehavior>();
      sdb.HttpHelpPageEnabled = false;
      sdb.IncludeExceptionDetailInFaults = true;

      wsh.Open();

      Console.WriteLine("SERVER - Running...");
      this.m_stopFlag.WaitOne();

      Console.WriteLine("SERVER - Shutting down...");
      svh.Close();
      wsh.Close();

      Console.WriteLine("SERVER - Shut down!");
    }
  }

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

          var data = s.GetData();
          Console.WriteLine("CLIENT - Data from service: " + data.MyInt);
        }

        ((ICommunicationObject)s).Close();
      }

      // shutdown server
      server.Stop();
    }
  }
}
