import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EmailService } from '../../consumer-service/src/email.service';

export interface Order {
  orderId: string;
  customerName: string;
  email: string;
  items: string[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface CreateOrderDto {
  customerName: string;
  email: string;
  items: string[];
  totalAmount: number;
}

@Injectable()
export class ProducerServiceService {
  private readonly logger = new Logger(ProducerServiceService.name);
  private orders: Map<string, Order> = new Map(); // Giả lập database

  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    private readonly emailService: EmailService,
  ) {}

  async sendMessage(message: string) {
    const pattern = { cmd: 'process_message' };
    const payload = { message, timestamp: new Date().toISOString() };
    
    this.client.emit(pattern, payload);
    return { 
      success: true, 
      message: 'Message sent to RabbitMQ', 
      data: payload 
    };
  }

  /**
   * Phương thức ĐỒNG BỘ - KHÔNG dùng MQ
   * Phải đợi cả việc lưu DB và gửi email → CHẬM
   */
  async createOrderSync(orderData: CreateOrderDto) {
    const startTime = Date.now();
    this.logger.log('[SYNC] Bắt đầu xử lý đơn hàng ĐỒNG BỘ...');

    // Bước 1: Tạo đơn hàng (nhanh - 100ms)
    const order = await this.saveOrderToDatabase(orderData);
    this.logger.log(`[SYNC] Đã lưu đơn hàng: ${order.orderId}`);

    // Bước 2: Gửi email XÁC NHẬN (chậm - 3 giây)
    // User phải ĐỢI email gửi xong mới nhận được response
    await this.sendEmailSync(order);
    this.logger.log(`[SYNC] Đã gửi email xác nhận đến ${order.email}`);

    const duration = Date.now() - startTime;
    this.logger.warn(`[SYNC] Tổng thời gian: ${duration}ms`);

    return {
      success: true,
      message: 'Đặt hàng thành công! Email xác nhận đã được gửi.',
      order,
      processingTime: `${duration}ms`,
      method: 'SYNCHRONOUS (Không dùng MQ)',
      note: 'User phải đợi email gửi xong -> CHẬM, dễ timeout'
    };
  }

  /**
   * Phương thức BẤT ĐỒNG BỘ - DÙNG MQ ✅
   * Chỉ lưu DB và đẩy job vào queue → NHANH
   */
  async createOrderAsync(orderData: CreateOrderDto) {
    const startTime = Date.now();
    this.logger.log('[ASYNC] Bắt đầu xử lý đơn hàng BẤT ĐỒNG BỘ...');

    // Bước 1: Tạo đơn hàng (nhanh - 100ms)
    const order = await this.saveOrderToDatabase(orderData);
    this.logger.log(`[ASYNC] Đã lưu đơn hàng: ${order.orderId}`);

    // Bước 2: Đẩy job GỬI EMAIL vào RabbitMQ (rất nhanh - 10ms)
    // User KHÔNG phải đợi, email sẽ được gửi ở nền bởi Worker
    const emailJob = {
      orderId: order.orderId,
      email: order.email,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      items: order.items,
    };

    this.client.emit({ cmd: 'send_email' }, emailJob);
    this.logger.log(`[ASYNC] Đã đẩy job gửi email vào queue`);

    const duration = Date.now() - startTime;
    this.logger.log(`[ASYNC] Tổng thời gian: ${duration}ms`);

    return {
      success: true,
      message: 'Đặt hàng thành công! Email xác nhận sẽ được gửi ngay.',
      order,
      processingTime: `${duration}ms`,
      method: 'ASYNCHRONOUS (Dùng Message Queue)',
      note: 'User nhận response ngay lập tức. Email được gửi bởi Worker ở nền.'
    };
  }

  /**
   * Giả lập lưu đơn hàng vào database (100ms)
   */
  private async saveOrderToDatabase(orderData: CreateOrderDto): Promise<Order> {
    await this.sleep(100); // Giả lập latency của database

    const order: Order = {
      orderId: `ORD-${Date.now()}`,
      ...orderData,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.orders.set(order.orderId, order);
    return order;
  }

  /**
   * Gửi email ĐỒNG BỘ THẬT (3 giây) - CHẬM
   */
  private async sendEmailSync(order: Order): Promise<void> {
    try {
      await this.emailService.sendOrderConfirmation({
        orderId: order.orderId,
        email: order.email,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        items: order.items,
      });
      this.logger.log(`Email THẬT đã gửi đến ${order.email}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email: ${error.message}`);
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getHello(): string {
    return 'Producer Service is running!';
  }
}
