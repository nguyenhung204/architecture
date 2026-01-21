package Strategy;

public class VatTaxStrategy implements TaxStrategy {
    private final double vatRate; // ví dụ 0.1 = 10%
    public VatTaxStrategy(double vatRate) { this.vatRate = vatRate; }
    public String name() { return "VAT " + (vatRate * 100) + "%"; }
    public double calcTax(double basePrice) { return basePrice * vatRate; }
}
