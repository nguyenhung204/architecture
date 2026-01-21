package Strategy;

public class Product {
    private final String name;
    private final double basePrice;
    private TaxStrategy taxStrategy;

    public Product(String name, double basePrice, TaxStrategy taxStrategy) {
        this.name = name;
        this.basePrice = basePrice;
        this.taxStrategy = taxStrategy;
    }

    public void setTaxStrategy(TaxStrategy taxStrategy) {
        this.taxStrategy = taxStrategy;
    }

    public double getTax() {
        return taxStrategy.calcTax(basePrice);
    }

    public double getFinalPrice() {
        return basePrice + getTax();
    }

    public void printBillLine() {
        double tax = getTax();
        System.out.printf(
                "%-15s | Base: %10.2f | Tax(%-12s): %10.2f | Total: %10.2f%n",
                name, basePrice, taxStrategy.name(), tax, getFinalPrice()
        );
    }
}
