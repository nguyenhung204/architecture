package Decorator;

public class DiscountPercentDecorator extends PaymentDecorator{
    private final double discountRate; // ví dụ 0.10 = 10%
    private final double maxDiscount;  // trần giảm tối đa

    public DiscountPercentDecorator(Payment wrappee, double discountRate, double maxDiscount) {
        super(wrappee);
        this.discountRate = discountRate;
        this.maxDiscount = maxDiscount;
    }

    @Override
    public double total() {
        double base = wrappee.total();
        double discount = Math.min(base * discountRate, maxDiscount);
        return Math.max(0, base - discount);
    }

    @Override
    public void pay() {
        double base = wrappee.total();
        double discount = Math.min(base * discountRate, maxDiscount);
        System.out.printf("[Discount] -%.0f (%.2f%%, cap %.0f)%n", discount, discountRate * 100, maxDiscount);
        System.out.printf("=> Total after discount: %.0f%n", total());
        wrappee.pay();
    }
}
