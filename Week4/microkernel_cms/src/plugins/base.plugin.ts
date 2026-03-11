import { IEventBus, EventHandler } from '../core/interfaces/event.interface';
import { IPlugin } from '../core/interfaces/plugin.interface';

export abstract class BasePlugin implements IPlugin {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly description: string;

  private registeredEvents: string[] = [];

  abstract onLoad(eventBus: IEventBus): void;

  onUnload(eventBus: IEventBus): void {
    this.registeredEvents.forEach((event) => eventBus.off(event, this.name));
    this.registeredEvents = [];
  }

  protected register(
    eventBus: IEventBus,
    event: string,
    handler: EventHandler,
  ): void {
    eventBus.on(event, this.name, handler.bind(this));
    this.registeredEvents.push(event);
  }
}
