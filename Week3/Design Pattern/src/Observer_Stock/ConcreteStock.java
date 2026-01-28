package Observer_Stock;

import java.util.ArrayList;
import java.util.List;

// Concrete Subject
public class ConcreteStock implements Stock {
    private final String name;
    private double price;
    private final List<Investor> investors = new ArrayList<>();

    public ConcreteStock(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public void setPrice(double price) {
        this.price = price;
        notifyInvestors();
    }

    @Override
    public void attach(Investor investor) {
        investors.add(investor);
    }

    @Override
    public void detach(Investor investor) {
        investors.remove(investor);
    }

    @Override
    public void notifyInvestors() {
        for (Investor investor : investors) {
            investor.update(name, price);
        }
    }
}
