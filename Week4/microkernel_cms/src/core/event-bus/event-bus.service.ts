import { Global, Injectable } from '@nestjs/common';
import { EventHandler, IEventBus } from '../interfaces/event.interface';

@Injectable()
export class EventBusService implements IEventBus {
  private readonly handlers = new Map<string, Map<string, EventHandler>>();

  on(event: string, pluginName: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Map());
    }
    this.handlers.get(event)!.set(pluginName, handler);
  }

  off(event: string, pluginName: string): void {
    this.handlers.get(event)?.delete(pluginName);
  }

  async emit(event: string, payload: any): Promise<any[]> {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers || eventHandlers.size === 0) return [];

    const results = await Promise.all(
      [...eventHandlers.values()].map((handler) =>
        Promise.resolve(handler(payload)),
      ),
    );
    return results.filter((r) => r !== undefined && r !== null);
  }

  getRegisteredEvents(): string[] {
    return [...this.handlers.keys()];
  }
}
