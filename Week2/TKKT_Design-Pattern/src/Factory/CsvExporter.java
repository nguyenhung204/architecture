package Factory;

public class CsvExporter implements ReportExporter {
    @Override
    public String exportReport(String reportName, String data) {
        return "[CSV] " + reportName + " -> col1,col2\n" + data;
    }
}
