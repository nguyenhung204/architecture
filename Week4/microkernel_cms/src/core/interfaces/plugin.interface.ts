import { IEventBus } from './event.interface';

export interface IPlugin {
  name: string;
  version: string;
  description: string;
  onLoad(eventBus: IEventBus): void;
  onUnload(eventBus: IEventBus): void;
}

export interface PluginRecord {
  plugin: IPlugin;
  enabled: boolean;
  loadedAt: Date | null;
}
