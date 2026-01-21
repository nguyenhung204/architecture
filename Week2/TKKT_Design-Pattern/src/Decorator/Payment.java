package Decorator;

public interface Payment {
    double total();     // số tiền cuối cùng phải trả
    void pay();         // thực hiện thanh toán
}
