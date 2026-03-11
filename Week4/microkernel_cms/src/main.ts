import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n  Microkernel CMS running  →  http://localhost:${port}/api`);
  console.log('  Architecture  : Microkernel (Core System + Plug-in Components)');
  console.log('  Write API key : cms-secret-key   (header: X-API-Key)');
  console.log('  GET /api      → system info + active plugins\n');
}
bootstrap();
