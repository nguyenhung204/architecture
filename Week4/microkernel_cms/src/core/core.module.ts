import { Module } from '@nestjs/common';
import { EventBusModule } from './event-bus/event-bus.module';
import { SecurityModule } from './security/security.module';
import { PluginRegistryModule } from './plugin-registry/plugin-registry.module';
import { ContentEngineModule } from './content-engine/content-engine.module';

@Module({
  imports: [EventBusModule, SecurityModule, PluginRegistryModule, ContentEngineModule],
  exports: [EventBusModule, SecurityModule, PluginRegistryModule, ContentEngineModule],
})
export class CoreModule {}
