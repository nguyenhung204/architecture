import { Module } from '@nestjs/common';
import { SqlDatabaseService } from './sql/sql-database.service';
import { NoSqlDatabaseService } from './nosql/nosql-database.service';

@Module({
  providers: [SqlDatabaseService, NoSqlDatabaseService],
  exports: [SqlDatabaseService, NoSqlDatabaseService],
})
export class DatabaseModule {}
