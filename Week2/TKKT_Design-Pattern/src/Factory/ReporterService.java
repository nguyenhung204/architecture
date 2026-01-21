package Factory;

public class ReporterService {
    public String generateAndExport(String reportName, String rawData, ReportExporterFactory.Format format) {
        String preparedData = rawData.trim();

        ReportExporter exporter = ReportExporterFactory.create(format);
        return exporter.exportReport(reportName, preparedData);
    }
}
