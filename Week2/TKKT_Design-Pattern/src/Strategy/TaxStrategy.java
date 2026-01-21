package Strategy;

public interface TaxStrategy {
    String name();
    double calcTax(double basePrice);
}
