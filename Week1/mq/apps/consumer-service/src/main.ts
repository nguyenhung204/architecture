import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsumerServiceModule } from './consumer-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ConsumerServiceModule);
  
  // Kết nối đến RabbitMQ như một microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin123@localhost:5672'],
      queue: 'messages_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3001);
  
  console.log('Consumer Service is listening on port 3001');
  console.log('Connected to RabbitMQ and listening for messages...');
}
bootstrap();
