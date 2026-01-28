package Adapter;

public class JSONWebService implements JSONService {
    @Override
    public void sendJSON(String json) {
        System.out.println("JSON Web Service received: " + json);
    }
}
