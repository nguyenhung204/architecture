import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { ContentManagerService } from './content-manager/content-manager.service';
import { PluginManagerService } from './plugin-manager/plugin-manager.service';
import { UserManagerService } from './user-manager/user-manager.service';

@Module({
  imports: [PersistenceModule],
  providers: [ContentManagerService, PluginManagerService, UserManagerService],
  exports: [ContentManagerService, PluginManagerService, UserManagerService],
})
export class ServicesModule {}
