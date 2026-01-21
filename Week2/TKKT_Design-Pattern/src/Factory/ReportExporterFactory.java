package Factory;

public class ReportExporterFactory {
    public enum Format { PDF, CSV, JSON }
    public static ReportExporter create(Format format) {
        return switch (format) {
            case PDF -> new PdfExporter();
            case CSV -> new CsvExporter();
            case JSON -> new JsonExporter();
        };
    }

}
