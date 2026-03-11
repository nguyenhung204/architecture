import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SecurityService } from '../security.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly securityService: SecurityService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Record<string, any>>();
    const apiKey = request.headers['x-api-key'] as string | undefined;

    if (!apiKey || !this.securityService.validateApiKey(apiKey)) {
      throw new UnauthorizedException('Invalid or missing API key.');
    }
    return true;
  }
}
