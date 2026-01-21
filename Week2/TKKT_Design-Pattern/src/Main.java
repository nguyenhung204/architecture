import Decorator.*;
import Factory.ReportExporterFactory;
import Factory.ReporterService;
import Singleton.LoggingSingleTon;
import Singleton.OrderService;
import State.Order;
import Strategy.*;

import java.util.Objects;

public class Main {
    public static void main(String[] args) {
        //Singleton Pattern
        System.out.println("=== Singleton Pattern ===");
        OrderService orderService = new OrderService();
        orderService.placeOrder("u1", 120);
        orderService.placeOrder("u2", 250);

        // Singleton chỉ tạo ra 1 object duy nhất
        System.out.println("One object create ? " + (Objects.equals(LoggingSingleTon.getInstance(), LoggingSingleTon.getInstance()))); // true


        // Factory Pattern
        System.out.println("\n=== Factory Pattern ===");
        ReporterService service = new ReporterService();
        String raw = "Hung,90\nBao,85";
        String pdfReport = service.generateAndExport("Student Report", raw, ReportExporterFactory.Format.PDF);
        System.out.println(pdfReport);
        String csvReport = service.generateAndExport("Student Report", raw, ReportExporterFactory.Format.CSV);
        System.out.println(csvReport);
        String jsonReport = service.generateAndExport("Student Report", raw, ReportExporterFactory.Format.JSON);
        System.out.println(jsonReport);

        // State Pattern
        System.out.println("\n=== State Pattern ===");
        Order order = new Order("ORD-001");

        order.showStatus();
        order.verify();   // Mới tạo: kiểm tra thông tin
        order.process();  // Đang xử lý: đóng gói + vận chuyển
        order.deliver();  // Đã giao: cập nhật đã giao
        order.cancel();   // Không cho hủy khi đã giao

        System.out.println("\n--- Test hủy sớm ---");
        Order order2 = new Order("ORD-002");
        order2.cancel();  // Mới tạo -> Hủy (hoàn tiền)
        order2.process(); // Không cho xử lý khi đã hủy

        //Strategy Pattern

        System.out.println("\n=== Strategy Pattern ===");
        TaxStrategy vat10 = new VatTaxStrategy(0.10);
        TaxStrategy excise20 = new ExciseTaxStrategy(0.20);
        TaxStrategy luxury30 = new LuxuryTaxStrategy(0.30);
        TaxStrategy noTax = new NoTaxStrategy();

        Product book = new Product("Book", 100_000, noTax);
        Product beer = new Product("Beer", 50_000, excise20);
        Product perfume = new Product("Perfume", 1_000_000, vat10);
        Product luxuryBag = new Product("Luxury Bag", 10_000_000, luxury30);

        System.out.println("=== BILL===");
        book.printBillLine();
        beer.printBillLine();
        perfume.printBillLine();
        luxuryBag.printBillLine();

        System.out.println("\n---Change strategy---");
        perfume.setTaxStrategy(luxury30);
        perfume.printBillLine();

        //Decorator Pattern
        System.out.println("\n=== Decorator Pattern ===");
        double amount = 1_000_000;

        // 1) Thanh toán thường bằng thẻ
        Payment p1 = new CreditCardPayment(amount, "4111-****-****-1111");
        p1.pay();

        System.out.println();

        // 2) Thẻ + phí xử lý 2.5%
        Payment p2 = new ProcessingFeeDecorator(
                new CreditCardPayment(amount, "4111-****-****-1111"),
                0.025
        );
        p2.pay();

        System.out.println();

        // 3) PayPal + giảm giá 10% (tối đa 80k) + phí cố định 15k
        Payment p3 = new ProcessingFeeFixedDecorator(
                new DiscountPercentDecorator(
                        new PayPalPayment(amount, "nguyenhung2004200@gmail.com"),
                        0.10,
                        80_000
                ),
                15_000
        );
        p3.pay();
    }

}

