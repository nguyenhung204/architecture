package Strategy;

public class ExciseTaxStrategy implements TaxStrategy {
    private final double exciseRate; // thuế tiêu thụ
    public ExciseTaxStrategy(double exciseRate) { this.exciseRate = exciseRate; }
    public String name() { return "Excise " + (exciseRate * 100) + "%"; }
    public double calcTax(double basePrice) { return basePrice * exciseRate; }
}
