package Strategy;

public class LuxuryTaxStrategy implements TaxStrategy{
    private final double luxuryRate; // thuế xa xỉ
    public LuxuryTaxStrategy(double luxuryRate) { this.luxuryRate = luxuryRate; }
    public String name() { return "Luxury " + (luxuryRate * 100) + "%"; }
    public double calcTax(double basePrice) { return basePrice * luxuryRate; }
}
