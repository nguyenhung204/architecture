import { Injectable } from '@nestjs/common';
import { BasePlugin } from './base.plugin';
import { IEventBus, CmsEvent } from '../core/interfaces/event.interface';

@Injectable()
export class AuthPlugin extends BasePlugin {
  readonly name = 'auth';
  readonly version = '1.0.0';
  readonly description = 'Extended authentication — validates tokens with the ext- prefix';

  onLoad(eventBus: IEventBus): void {
    this.register(eventBus, CmsEvent.AUTH_VALIDATE, this.validateToken);
  }

  private validateToken(payload: {
    token: string;
  }): { valid: boolean; reason?: string } {
    if (!payload?.token) {
      return { valid: false, reason: 'No token provided.' };
    }
    if (payload.token.startsWith('ext-')) {
      return { valid: true };
    }
    return {
      valid: false,
      reason: 'Auth Plugin: extended tokens must use the "ext-" prefix.',
    };
  }
}
