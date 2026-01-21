package Singleton;

public class LoggingSingleTon {
    private int count = 0;
    private static LoggingSingleTon instance = null;

    private LoggingSingleTon() {}

    public static LoggingSingleTon getInstance() {
        if (instance == null) {
            instance = new LoggingSingleTon();
        }
        return instance;
    }

    public void log(String message) {
        count++;
        System.out.println("Log " + count + ": " + message);
    }
}
