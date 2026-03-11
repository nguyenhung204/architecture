import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.CMS_API_KEY ?? 'cms-secret-key';
  }

  validateApiKey(key: string): boolean {
    return key === this.apiKey;
  }
}
