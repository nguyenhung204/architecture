import { Injectable, Logger } from '@nestjs/common';
import { IPlugin, PluginRecord } from '../interfaces/plugin.interface';
import { EventBusService } from '../event-bus/event-bus.service';

@Injectable()
export class PluginRegistryService {
  private readonly logger = new Logger(PluginRegistryService.name);
  private readonly plugins = new Map<string, PluginRecord>();

  constructor(private readonly eventBus: EventBusService) {}

  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      this.logger.warn(`Plugin "${plugin.name}" is already registered.`);
      return;
    }
    const record: PluginRecord = { plugin, enabled: false, loadedAt: null };
    this.plugins.set(plugin.name, record);
    this.enable(plugin.name);
    this.logger.log(
      `Plugin "${plugin.name}" v${plugin.version} registered and enabled.`,
    );
  }

  enable(name: string): void {
    const record = this.plugins.get(name);
    if (!record) throw new Error(`Plugin "${name}" not found.`);
    if (record.enabled) return;
    record.plugin.onLoad(this.eventBus);
    record.enabled = true;
    record.loadedAt = new Date();
    this.logger.log(`Plugin "${name}" enabled.`);
  }

  disable(name: string): void {
    const record = this.plugins.get(name);
    if (!record) throw new Error(`Plugin "${name}" not found.`);
    if (!record.enabled) return;
    record.plugin.onUnload(this.eventBus);
    record.enabled = false;
    record.loadedAt = null;
    this.logger.log(`Plugin "${name}" disabled.`);
  }

  getAll(): Array<PluginRecord & { name: string }> {
    return [...this.plugins.entries()].map(([name, record]) => ({
      name,
      ...record,
    }));
  }

  getEnabledCount(): number {
    return [...this.plugins.values()].filter((r) => r.enabled).length;
  }
}
