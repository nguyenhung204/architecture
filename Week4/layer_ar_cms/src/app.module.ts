import { Module } from '@nestjs/common';
import { ServicesModule } from './services/services.module';
import { ContentController } from './controllers/content/content.controller';
import { AdminController } from './controllers/admin/admin.controller';
import { ApiController } from './controllers/api/api.controller';

@Module({
  imports: [ServicesModule],
  controllers: [ContentController, AdminController, ApiController],
})
export class AppModule {}
