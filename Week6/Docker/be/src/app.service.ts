import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello, Thiết Kế Kiến Trúc 2025 - 2026';
  }
}
