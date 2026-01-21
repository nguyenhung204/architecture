package Strategy;

public class NoTaxStrategy implements TaxStrategy {
    public String name() { return "No Tax"; }
    public double calcTax(double basePrice) { return 0.0; }
}
