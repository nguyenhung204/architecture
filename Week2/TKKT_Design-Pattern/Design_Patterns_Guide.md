# Design Patterns Guide

Tài liệu này mô tả các design pattern được sử dụng trong dự án và cách áp dụng chúng.

## 1. Singleton Pattern

### 1.1 Design Pattern này có tác dụng gì?
- Đảm bảo một class chỉ có duy nhất một instance trong toàn bộ ứng dụng
- Cung cấp một điểm truy cập toàn cục đến instance đó
- Tiết kiệm bộ nhớ và tài nguyên hệ thống
- Đảm bảo tính nhất quán dữ liệu khi cần chia sẻ trạng thái

### 1.2 Nếu không áp dụng design pattern này thì sao?
- Có thể tạo ra nhiều instance của cùng một class, dẫn đến lãng phí bộ nhớ
- Dữ liệu không nhất quán giữa các instance khác nhau
- Khó kiểm soát việc khởi tạo object
- Có thể gây xung đột khi nhiều object cùng truy cập tài nguyên chung

### 1.3 Ví dụ chi tiết
```java
// LoggingSingleTon class đảm bảo chỉ có một instance logger
public class LoggingSingleTon {
    private int count = 0;
    private static LoggingSingleTon instance = null;

    private LoggingSingleTon() {} // Constructor private

    public static LoggingSingleTon getInstance() {
        if (instance == null) {
            instance = new LoggingSingleTon();
        }
        return instance;
    }

    public void log(String message) {
        count++;
        System.out.println("Log " + count + ": " + message);
    }
}

// Sử dụng:
LoggingSingleTon logger1 = LoggingSingleTon.getInstance();
LoggingSingleTon logger2 = LoggingSingleTon.getInstance();
// logger1 và logger2 trỏ đến cùng một instance
```

---

## 2. Factory Pattern

### 2.1 Design Pattern này có tác dụng gì?
- Tạo ra objects mà không cần chỉ định class cụ thể
- Đóng gói logic tạo object vào một nơi tập trung
- Giúp code linh hoạt hơn khi cần thêm loại object mới
- Tách biệt việc tạo object khỏi việc sử dụng object

### 2.2 Nếu không áp dụng design pattern này thì sao?
- Client code phải biết và phụ thuộc vào các concrete class
- Khó mở rộng khi cần thêm loại object mới
- Logic tạo object bị rải rác khắp nơi
- Vi phạm nguyên tắc Open/Closed Principle

### 2.3 Ví dụ chi tiết
```java
// Factory tạo ra các loại ReportExporter khác nhau
public class ReportExporterFactory {
    public enum Format { PDF, CSV, JSON }
    
    public static ReportExporter create(Format format) {
        return switch (format) {
            case PDF -> new PdfExporter();
            case CSV -> new CsvExporter();
            case JSON -> new JsonExporter();
        };
    }
}

// Sử dụng:
ReportExporter exporter = ReportExporterFactory.create(Format.PDF);
exporter.export(data); // Không cần biết đó là PdfExporter
```

---

## 3. Strategy Pattern

### 3.1 Design Pattern này có tác dụng gì?
- Định nghĩa một họ các thuật toán và làm cho chúng có thể hoán đổi cho nhau
- Cho phép thay đổi thuật toán tại runtime
- Tách biệt thuật toán khỏi client sử dụng nó
- Giúp code tuân thủ nguyên tắc Open/Closed Principle

### 3.2 Nếu không áp dụng design pattern này thì sao?
- Phải sử dụng nhiều câu lệnh if-else hoặc switch-case phức tạp
- Khó thêm thuật toán mới mà không sửa đổi code hiện tại
- Code trở nên cứng nhắc và khó bảo trì
- Vi phạm nguyên tắc Single Responsibility Principle

### 3.3 Ví dụ chi tiết
```java
// Product có thể sử dụng các strategy tính thuế khác nhau
public class Product {
    private final String name;
    private final double basePrice;
    private TaxStrategy taxStrategy;

    public Product(String name, double basePrice, TaxStrategy taxStrategy) {
        this.name = name;
        this.basePrice = basePrice;
        this.taxStrategy = taxStrategy;
    }

    public void setTaxStrategy(TaxStrategy taxStrategy) {
        this.taxStrategy = taxStrategy;
    }

    public double getTax() {
        return taxStrategy.calcTax(basePrice);
    }
}

// Sử dụng:
Product product = new Product("Laptop", 1000, new VatTaxStrategy());
// Có thể thay đổi strategy: product.setTaxStrategy(new LuxuryTaxStrategy());
```

---

## 4. State Pattern

### 4.1 Design Pattern này có tác dụng gì?
- Cho phép object thay đổi hành vi khi trạng thái nội tại thay đổi
- Đóng gói các hành vi khác nhau của từng trạng thái vào các class riêng biệt
- Giúp code dễ hiểu và bảo trì hơn khi có nhiều trạng thái phức tạp
- Tránh việc sử dụng nhiều câu lệnh điều kiện phức tạp

### 4.2 Nếu không áp dụng design pattern này thì sao?
- Phải sử dụng nhiều câu lệnh if-else hoặc switch-case để kiểm tra trạng thái
- Code trở nên phức tạp và khó đọc khi có nhiều trạng thái
- Khó thêm trạng thái mới mà không ảnh hưởng đến code hiện tại
- Logic xử lý trạng thái bị rải rác khắp nơi

### 4.3 Ví dụ chi tiết
```java
// Order có thể ở nhiều trạng thái khác nhau
public class Order {
    private final String orderId;
    private OrderState state;
    
    public Order(String orderId) {
        this.orderId = orderId;
        this.state = new CreateState(); // Trạng thái ban đầu
    }

    public void setState(OrderState state) {
        this.state = state;
    }

    // Ủy quyền hành vi cho State hiện tại
    public void verify()  { state.verify(this); }
    public void process() { state.process(this); }
    public void deliver() { state.deliver(this); }
    public void cancel()  { state.cancel(this); }
}

// Mỗi trạng thái xử lý hành vi khác nhau
// CreateState -> ProcessingState -> DeliveredState
```

---

## 5. Decorator Pattern

### 5.1 Design Pattern này có tác dụng gì?
- Thêm chức năng mới cho object mà không thay đổi cấu trúc của nó
- Cho phép thêm nhiều "trang trí" (decorator) khác nhau một cách linh hoạt
- Tránh việc tạo quá nhiều subclass khi cần kết hợp nhiều tính năng
- Tuân thủ nguyên tắc Open/Closed Principle

### 5.2 Nếu không áp dụng design pattern này thì sao?
- Phải tạo rất nhiều subclass để kết hợp các tính năng khác nhau
- Code trở nên cứng nhắc, khó mở rộng
- Không thể thêm/bớt tính năng tại runtime
- Vi phạm nguyên tắc composition over inheritance

### 5.3 Ví dụ chi tiết
```java
// Payment interface cơ bản
public interface Payment {
    double total();
    void pay();
}

// Có thể thêm các decorator như phí xử lý, giảm giá
Payment payment = new CreditCardPayment(1000);
payment = new ProcessingFeeDecorator(payment, 50); // Thêm phí xử lý
payment = new DiscountPercentDecorator(payment, 10); // Thêm giảm giá

// Kết quả: 1000 + 50 - 10% = 945
```

---

## Kết luận

Các design pattern này giúp:
- **Code dễ bảo trì và mở rộng**
- **Giảm coupling giữa các component**
- **Tăng tính reusability**
- **Tuân thủ các nguyên tắc SOLID**
- **Làm code dễ hiểu và professional hơn**

Việc áp dụng đúng design pattern sẽ giúp dự án có architecture tốt và dễ phát triển trong tương lai.
