package Factory;

public class PdfExporter implements ReportExporter{
    @Override
    public String exportReport(String reportName, String data) {
        return "[PDF] " + reportName + " -> rendered_pdf_bytes(" + data.length() + ")";
    }
}
