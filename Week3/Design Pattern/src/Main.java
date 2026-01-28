import Adapter.JSONService;
import Adapter.JSONWebService;
import Adapter.XMLSystem;
import Adapter.XMLToJSONAdapter;
import Observer_Stock.ConcreteInvestor;
import Observer_Stock.ConcreteStock;
import Observer_Stock.Investor;
import Observer_Task.ConcreteTask;
import Observer_Task.Developer;
import Observer_Task.TaskStatus;
import Observer_Task.TeamMember;


public class Main {
    public static void main(String[] args) {

        //Observer Pattern - Stock Price Notification System
        System.out.println("--- Stock Price Notification System ---");
        ConcreteStock apple = new ConcreteStock("BIT", 150.0);

        Investor i1 = new ConcreteInvestor("Alice");
        Investor i2 = new ConcreteInvestor("Bob");

        apple.attach(i1);
        apple.attach(i2);

        apple.setPrice(155.5);
        apple.setPrice(160.0);

        //Observer Pattern - Task Status Notification System
        System.out.println("\n--- Task Status Notification System ---");
        ConcreteTask task = new ConcreteTask("Build Login Feature");

        TeamMember dev1 = new Developer("Hung");
        TeamMember dev2 = new Developer("Minh");

        task.attach(dev1);
        task.attach(dev2);

        task.setStatus(TaskStatus.IN_PROGRESS);
        task.setStatus(TaskStatus.DONE);

        //Adapter Pattern - XML to JSON Conversion System
        System.out.println("\n--- XML to JSON Conversion System ---");
        JSONService webService = new JSONWebService();
        XMLToJSONAdapter adapter = new XMLToJSONAdapter(webService);

        XMLSystem xmlData =
                new XMLSystem("<message>Hello, World!</message>");

        adapter.sendXML(xmlData);

    }
}