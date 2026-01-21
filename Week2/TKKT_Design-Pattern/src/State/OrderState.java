package State;

public interface OrderState {
    String name();

    void verify(Order order);   // kiểm tra thông tin
    void process(Order order);  // đóng gói + vận chuyển
    void deliver(Order order);  // cập nhật đã giao
    void cancel(Order order);   // hủy + hoàn tiền
}
