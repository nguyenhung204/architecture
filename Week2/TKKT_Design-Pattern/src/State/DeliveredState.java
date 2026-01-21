package State;

public class DeliveredState implements  OrderState {
    @Override public String name() { return "Đã giao"; }

    @Override
    public void verify(Order order) {
        System.out.println("[Đã giao]  Không cần verify. Đơn đã hoàn tất.");
    }

    @Override
    public void process(Order order) {
        System.out.println("[Đã giao]  Không thể xử lý lại sau khi đã giao.");
    }

    @Override
    public void deliver(Order order) {
        System.out.println("[Đã giao]  Đơn đã giao rồi.");
    }

    @Override
    public void cancel(Order order) {
        System.out.println("[Đã giao] Không thể hủy sau khi đã giao (cần quy trình trả hàng riêng).");
    }
}
