import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConsumerServiceController } from './consumer-service.controller';
import { ConsumerServiceService } from './consumer-service.service';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [ConsumerServiceController],
  providers: [ConsumerServiceService, EmailService],
})
export class ConsumerServiceModule {}
