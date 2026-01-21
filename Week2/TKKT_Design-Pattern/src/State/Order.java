package State;


//Context
public class Order {
    private final String orderId;
    private OrderState state;
    public Order(String orderId) {
        this.orderId = orderId;
        this.state = new CreateState();
    }

    public String getOrderId() {
        return orderId;
    }

    public void setState(OrderState state) {
        this.state = state;
    }

    public void showStatus() {
        System.out.println("Order " + orderId + " trạng thái: " + state.name());
    }

    // Các hành vi được "ủy quyền" cho State hiện tại
    public void verify()  { state.verify(this); }
    public void process() { state.process(this); }
    public void deliver() { state.deliver(this); }
    public void cancel()  { state.cancel(this); }
}
