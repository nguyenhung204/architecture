import { BasePlugin } from './base.plugin';

export class AuthPlugin extends BasePlugin {
  readonly name = 'auth';
  readonly version = '1.1.0';
  readonly description =
    'Extended authentication — validates tokens with the "ext-" prefix';

  constructor() {
    super(false); // disabled by default — must be explicitly enabled via Admin API
  }

  onAuthValidate(token: string): { valid: boolean; reason?: string } {
    if (!token) {
      return { valid: false, reason: 'No token provided.' };
    }
    if (token.startsWith('ext-')) {
      return { valid: true };
    }
    return {
      valid: false,
      reason: 'Auth Plugin: extended tokens must use the "ext-" prefix.',
    };
  }
}
