import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProducerServiceService } from './producer-service.service';
import type { CreateOrderDto } from './producer-service.service';

@Controller()
export class ProducerServiceController {
  constructor(private readonly producerServiceService: ProducerServiceService) {}

  @Get()
  getHello(): string {
    return this.producerServiceService.getHello();
  }

  @Post('send')
  async sendMessage(@Body('message') message: string) {
    return this.producerServiceService.sendMessage(message);
  }

  /**
   * Endpoint giả lập đặt hàng - KHÔNG dùng MQ (chậm)
   * User phải đợi cả việc tạo đơn VÀ gửi email
   */
  @Post('orders/sync')
  async createOrderSync(@Body() orderData: CreateOrderDto) {
    return this.producerServiceService.createOrderSync(orderData);
  }

  /**
   * Endpoint giả lập đặt hàng - DÙNG MQ (nhanh)
   * User chỉ đợi tạo đơn, email gửi bất đồng bộ qua worker
   */
  @Post('orders/async')
  async createOrderAsync(@Body() orderData: CreateOrderDto) {
    return this.producerServiceService.createOrderAsync(orderData);
  }
}
