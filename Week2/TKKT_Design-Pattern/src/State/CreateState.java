package State;

public class CreateState implements OrderState {
    @Override public String name() { return "Mới tạo"; }

    @Override
    public void verify(Order order) {
        System.out.println("[Mới tạo] Kiểm tra thông tin đơn hàng: " + order.getOrderId());
        System.out.println("Thông tin hợp lệ -> chuyển sang 'Đang xử lý'");
        order.setState((OrderState) new ProcessingState());
        order.showStatus();
    }

    @Override
    public void process(Order order) {
        System.out.println("[Mới tạo] Chưa thể đóng gói/vận chuyển. Hãy verify() trước.");
    }

    @Override
    public void deliver(Order order) {
        System.out.println("[Mới tạo] Không thể giao khi chưa xử lý.");
    }

    @Override
    public void cancel(Order order) {
        System.out.println("[Mới tạo] Hủy đơn: " + order.getOrderId());
        System.out.println("Hoàn tiền -> chuyển sang 'Hủy'");
        order.setState((OrderState) new CancelledState());
        order.showStatus();
    }

}
