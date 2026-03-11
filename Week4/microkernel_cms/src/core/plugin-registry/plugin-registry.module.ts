import { Module } from '@nestjs/common';
import { PluginRegistryService } from './plugin-registry.service';
import { PluginRegistryController } from './plugin-registry.controller';

@Module({
  controllers: [PluginRegistryController],
  providers: [PluginRegistryService],
  exports: [PluginRegistryService],
})
export class PluginRegistryModule {}
