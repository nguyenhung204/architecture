import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor() {

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true cho port 465, false cho port 587
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password',
      },
    });

    this.logger.log('Email Service initialized');
    this.logger.log(`   SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    this.logger.log(`   SMTP User: ${process.env.SMTP_USER || 'your-email@gmail.com'}`);
  }

  /**
   * Gửi email xác nhận đơn hàng
   */
  async sendOrderConfirmation(data: {
    orderId: string;
    email: string;
    customerName: string;
    totalAmount: number;
    items: string[];
  }): Promise<void> {
    try {
      const emailHtml = this.generateOrderEmailHtml(data);

      const mailOptions = {
        from: `"Order System" <${process.env.SMTP_USER || 'noreply@example.com'}>`,
        to: data.email,
        subject: `Xác nhận đơn hàng ${data.orderId}`,
        html: emailHtml,
        text: this.generateOrderEmailText(data),
      };

      this.logger.log(`Đang gửi email đến ${data.email}...`);
      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email đã gửi thành công!`);
      this.logger.log(`   Message ID: ${info.messageId}`);
      this.logger.log(`   To: ${data.email}`);
      this.logger.log(`   Order: ${data.orderId}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tạo nội dung email HTML
   */
  private generateOrderEmailHtml(data: {
    orderId: string;
    customerName: string;
    totalAmount: number;
    items: string[];
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-id { font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }
          .info-row { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .label { font-weight: bold; color: #667eea; }
          .items { list-style: none; padding: 0; }
          .items li { padding: 10px; margin: 5px 0; background: white; border-radius: 5px; border-left: 3px solid #667eea; }
          .total { font-size: 20px; font-weight: bold; color: #764ba2; padding: 20px; background: white; border-radius: 5px; text-align: center; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Đơn hàng đã được xác nhận!</h1>
          </div>
          <div class="content">
            <div class="info-row">
              <p>Xin chào <span class="label">${data.customerName}</span>,</p>
              <p>Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đã được xác nhận thành công.</p>
            </div>
            
            <div class="info-row">
              <p><span class="label">Mã đơn hàng:</span></p>
              <div class="order-id">${data.orderId}</div>
            </div>
            
            <div class="info-row">
              <p><span class="label">Sản phẩm:</span></p>
              <ul class="items">
                ${data.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            
            <div class="total">
              Tổng tiền: <span style="color: #764ba2;">${data.totalAmount.toLocaleString('vi-VN')} VNĐ</span>
            </div>
            
            <div class="info-row">
              <p>Chúng tôi sẽ xử lý đơn hàng và giao cho bạn trong thời gian sớm nhất!</p>
              <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.</p>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2026 Order System - Message Queue Demo</p>
            <p>Email này được gửi tự động từ hệ thống qua RabbitMQ Worker</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Tạo nội dung email dạng text (fallback)
   */
  private generateOrderEmailText(data: {
    orderId: string;
    customerName: string;
    totalAmount: number;
    items: string[];
  }): string {
    return `
Xin chào ${data.customerName},

Đơn hàng ${data.orderId} của bạn đã được xác nhận!

Sản phẩm:
${data.items.map((item, i) => `${i + 1}. ${item}`).join('\n')}

Tổng tiền: ${data.totalAmount.toLocaleString('vi-VN')} VNĐ

Cảm ơn bạn đã đặt hàng!

---
© 2026 Order System
Email này được gửi tự động từ hệ thống qua RabbitMQ Worker
    `.trim();
  }

  /**
   * Kiểm tra kết nối SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified');
      return true;
    } catch (error) {
      this.logger.error(`SMTP connection failed: ${error.message}`);
      return false;
    }
  }
}
