import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConsumerServiceService } from './consumer-service.service';

@Controller()
export class ConsumerServiceController {
  constructor(private readonly consumerServiceService: ConsumerServiceService) {}

  @Get()
  getHello(): string {
    return this.consumerServiceService.getHello();
  }

  @MessagePattern({ cmd: 'process_message' })
  async handleMessage(@Payload() data: any) {
    return this.consumerServiceService.processMessage(data);
  }

  /**
   * Lắng nghe job gửi email từ RabbitMQ
   * Pattern: { cmd: 'send_email' }
   */
  @MessagePattern({ cmd: 'send_email' })
  async handleSendEmail(@Payload() emailJob: any) {
    return this.consumerServiceService.sendEmailJob(emailJob);
  }
}
