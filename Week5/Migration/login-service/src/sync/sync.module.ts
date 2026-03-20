import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [UsersModule],
  controllers: [SyncController],
})
export class SyncModule {}
