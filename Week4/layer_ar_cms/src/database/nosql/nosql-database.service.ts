import { Injectable } from '@nestjs/common';

@Injectable()
export class NoSqlDatabaseService {
  private store = new Map<string, any>();

  get(key: string): any | undefined {
    return this.store.get(key);
  }

  set(key: string, value: any): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }
}
