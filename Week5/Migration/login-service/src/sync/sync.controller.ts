import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from '../users/users.service.js';

interface UserCreatedPayload {
  email: string;
  password: string;
  name?: string;
}

@Controller()
export class SyncController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: UserCreatedPayload) {
    await this.usersService.syncUser(data.email, data.password, data.name);
  }
}
