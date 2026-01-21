package Decorator;

public class ProcessingFeeDecorator extends PaymentDecorator {
    private final double feeRate;

    public ProcessingFeeDecorator(Payment wrappee, double feeRate) {
        super(wrappee);
        this.feeRate = feeRate;
    }

    @Override
    public double total() {
        double base = wrappee.total();
        double fee = base * feeRate;
        return base + fee;
    }

    @Override
    public void pay() {
        double base = wrappee.total();
        double fee = base * feeRate;
        System.out.printf("[Fee] +%.0f (%.2f%%)%n", fee, feeRate * 100);
        System.out.printf("=> Total after fee: %.0f%n", total());
        wrappee.pay();
    }
}
