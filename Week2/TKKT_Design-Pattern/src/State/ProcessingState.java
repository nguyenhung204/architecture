package State;

public class ProcessingState implements OrderState {
    @Override public String name() { return "Đang xử lý"; }

    @Override
    public void verify(Order order) {
        System.out.println("[Đang xử lý]  Đơn đã verify rồi, không cần verify lại.");
    }

    @Override
    public void process(Order order) {
        System.out.println("[Đang xử lý] Đóng gói đơn: " + order.getOrderId());
        System.out.println("[Đang xử lý] Bàn giao vận chuyển (mô phỏng)...");
        System.out.println("Xử lý xong -> cho phép deliver()");
    }

    @Override
    public void deliver(Order order) {
        System.out.println("[Đang xử lý] Cập nhật đơn đã giao: " + order.getOrderId());
        order.setState((OrderState) new DeliveredState());
        order.showStatus();
    }

    @Override
    public void cancel(Order order) {
        System.out.println("[Đang xử lý] Hủy đơn: " + order.getOrderId());
        System.out.println("💸 Hoàn tiền (mô phỏng) -> chuyển sang 'Hủy'");
        order.setState((OrderState) new CancelledState());
        order.showStatus();
    }
}
