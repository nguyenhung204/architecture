import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern({ cmd: 'find_user_by_email' })
  findByEmail(@Payload() email: string) {
    return this.usersService.findByEmail(email);
  }

  @MessagePattern({ cmd: 'create_user' })
  createUser(
    @Payload() data: { email: string; hashedPassword: string; name?: string },
  ) {
    return this.usersService.create(data.email, data.hashedPassword, data.name);
  }
}
