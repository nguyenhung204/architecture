package Decorator;

public class PaymentDecorator implements Payment{
    protected final Payment wrappee;

    protected PaymentDecorator(Payment wrappee) {
        this.wrappee = wrappee;
    }

    @Override
    public double total() {
        return wrappee.total();
    }

    @Override
    public void pay() {
        wrappee.pay();
    }
}
