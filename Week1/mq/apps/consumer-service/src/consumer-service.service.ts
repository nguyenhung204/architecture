import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

export interface EmailJob {
  orderId: string;
  email: string;
  customerName: string;
  totalAmount: number;
  items: string[];
}

@Injectable()
export class ConsumerServiceService {
  private readonly logger = new Logger(ConsumerServiceService.name);

  constructor(private readonly emailService: EmailService) {}

  async processMessage(data: any) {
    this.logger.log('Received message from RabbitMQ:');
    this.logger.log(JSON.stringify(data, null, 2));
    
    // Xử lý message ở đây
    const result = {
      status: 'processed',
      receivedAt: new Date().toISOString(),
      originalMessage: data.message,
      originalTimestamp: data.timestamp,
    };
    
    this.logger.log('Message processed successfully');
    return result;
  }

  /**
   * Email Worker - Xử lý job gửi email từ RabbitMQ
   * Chạy bất đồng bộ, không block Order Service
   * 🔥 GỬI EMAIL THẬT qua SMTP
   */
  async sendEmailJob(emailJob: EmailJob) {
    this.logger.log('[EMAIL WORKER] Nhận job gửi email từ queue');
    this.logger.log(`   Order ID: ${emailJob.orderId}`);
    this.logger.log(`   Email: ${emailJob.email}`);
    this.logger.log(`   Customer: ${emailJob.customerName}`);

    try {
      // GỬI EMAIL THẬT qua SMTP (Nodemailer)
      await this.emailService.sendOrderConfirmation({
        orderId: emailJob.orderId,
        email: emailJob.email,
        customerName: emailJob.customerName,
        totalAmount: emailJob.totalAmount,
        items: emailJob.items,
      });

      this.logger.log('[EMAIL WORKER] Email THẬT đã gửi thành công!');

      return {
        status: 'EMAIL_SENT',
        orderId: emailJob.orderId,
        sentTo: emailJob.email,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`[EMAIL WORKER] Lỗi khi gửi email: ${error.message}`);
      // Trong thực tế, có thể retry hoặc đẩy vào Dead Letter Queue
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getHello(): string {
    return 'Consumer Service is running!';
  }
}
