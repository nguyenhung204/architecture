import { NestFactory } from '@nestjs/core';
import { ProducerServiceModule } from './producer-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ProducerServiceModule);
  await app.listen(process.env.port ?? 3000);
  
  console.log('Producer Service is listening on port 3000');
  console.log('Send messages via POST http://localhost:3000/send');
}
bootstrap();
