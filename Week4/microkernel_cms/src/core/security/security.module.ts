import { Global, Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@Global()
@Module({
  providers: [SecurityService, ApiKeyGuard],
  exports: [SecurityService, ApiKeyGuard],
})
export class SecurityModule {}
