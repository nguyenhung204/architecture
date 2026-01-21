package State;

public class CancelledState  implements OrderState {
    @Override public String name() { return "Hủy"; }

    @Override
    public void verify(Order order) {
        System.out.println("[Hủy]  Đơn đã bị hủy, không thể verify.");
    }

    @Override
    public void process(Order order) {
        System.out.println("[Hủy]  Đơn đã bị hủy, không thể xử lý.");
    }

    @Override
    public void deliver(Order order) {
        System.out.println("[Hủy] Đơn đã bị hủy, không thể giao.");
    }

    @Override
    public void cancel(Order order) {
        System.out.println("[Hủy]  Đơn đã hủy rồi.");
    }
}
