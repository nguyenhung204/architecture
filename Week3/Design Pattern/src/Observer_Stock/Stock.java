package Observer_Stock;
// Subject interface
public interface Stock {
    void attach(Investor investor);
    void detach(Investor investor);
    void notifyInvestors();
}
