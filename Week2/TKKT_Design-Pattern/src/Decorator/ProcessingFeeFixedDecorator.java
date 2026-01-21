package Decorator;

public class ProcessingFeeFixedDecorator extends PaymentDecorator{
    private final double fee;

    public ProcessingFeeFixedDecorator(Payment wrappee, double fee) {
        super(wrappee);
        this.fee = fee;
    }

    @Override
    public double total() {
        return wrappee.total() + fee;
    }

    @Override
    public void pay() {
        System.out.printf("[Fee] +%.0f (fixed)%n", fee);
        System.out.printf("=> Total after fee: %.0f%n", total());
        wrappee.pay();
    }
}
