import { Injectable } from '@nestjs/common';
import { NoSqlDatabaseService } from '../../database/nosql/nosql-database.service';

@Injectable()
export class CacheService {
  constructor(private readonly nosql: NoSqlDatabaseService) {}

  get<T>(key: string): T | undefined {
    return this.nosql.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this.nosql.set(key, value);
  }

  delete(key: string): void {
    this.nosql.delete(key);
  }

  clear(): void {
    this.nosql.clear();
  }

  has(key: string): boolean {
    return this.nosql.has(key);
  }
}
