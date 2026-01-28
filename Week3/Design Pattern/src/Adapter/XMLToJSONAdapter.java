package Adapter;

// Adapter class
public class XMLToJSONAdapter  {
    private JSONService jsonService;

    public XMLToJSONAdapter(JSONService jsonService) {
        this.jsonService = jsonService;
    }

    public void sendXML(XMLSystem xmlData) {
        System.out.println("Client sends XML: " + xmlData.getXML());

        String json = convertXMLToJSON(xmlData.getXML());
        System.out.println("Converted XML to JSON: " + json);

        jsonService.sendJSON(json);
    }

    // Demo chuyển đổi (thực tế dùng Jackson / JAXB)
    private String convertXMLToJSON(String xml) {
        return "{ \"message\": \"Hello, World!\" }";
    }

}
