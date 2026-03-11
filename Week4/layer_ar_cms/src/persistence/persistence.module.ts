import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { OrmService } from './orm/orm.service';
import { ContentRepository } from './repository/content.repository';
import { UserRepository } from './repository/user.repository';
import { CacheService } from './cache/cache.service';

@Module({
  imports: [DatabaseModule],
  providers: [OrmService, ContentRepository, UserRepository, CacheService],
  exports: [ContentRepository, UserRepository, CacheService],
})
export class PersistenceModule {}
