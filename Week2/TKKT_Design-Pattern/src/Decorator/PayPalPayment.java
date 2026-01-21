package Decorator;

public class PayPalPayment implements Payment {
    private final double amount;
    private final String email;

    public PayPalPayment(double amount, String email) {
        this.amount = amount;
        this.email = email;
    }

    @Override
    public double total() {
        return amount;
    }

    @Override
    public void pay() {
        System.out.printf("[PayPal] Pay %.0f using account %s%n", total(), email);
    }
}
