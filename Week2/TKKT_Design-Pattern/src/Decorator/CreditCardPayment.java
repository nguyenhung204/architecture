package Decorator;

public class CreditCardPayment implements Payment{
    private final double amount;
    private final String maskedCard;

    public CreditCardPayment(double amount, String maskedCard) {
        this.amount = amount;
        this.maskedCard = maskedCard;
    }

    @Override
    public double total() {
        return amount;
    }

    @Override
    public void pay() {
        System.out.printf("[CreditCard] Pay %.0f using card %s%n", total(), maskedCard);
    }
}
