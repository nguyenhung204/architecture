export enum CmsEvent {
  CONTENT_CREATED = 'content.created',
  CONTENT_UPDATED = 'content.updated',
  CONTENT_DELETED = 'content.deleted',
  CONTENT_READ = 'content.read',
  AUTH_VALIDATE = 'auth.validate',
}

export type EventHandler = (payload: any) => Promise<any> | any;

export interface IEventBus {
  on(event: string, pluginName: string, handler: EventHandler): void;
  off(event: string, pluginName: string): void;
  emit(event: string, payload: any): Promise<any[]>;
}
