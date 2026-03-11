import { Module } from '@nestjs/common';
import { ContentEngineService } from './content-engine.service';
import { ContentEngineController } from './content-engine.controller';

@Module({
  controllers: [ContentEngineController],
  providers: [ContentEngineService],
  exports: [ContentEngineService],
})
export class ContentEngineModule {}
