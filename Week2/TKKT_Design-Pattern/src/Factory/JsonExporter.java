package Factory;

public class JsonExporter implements ReportExporter {
    @Override
    public String exportReport(String reportName, String data) {
        return "[JSON] {\"name\":\"" + reportName + "\",\"data\":\"" + data + "\"}";
    }
}
