import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class RegisterService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.email, hashedPassword, dto.name);

    // Publish event so login-service can sync this user to its own DB
    this.client.emit('user_created', {
      email: user.email,
      password: user.password, // already hashed
      name: user.name,
    });

    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    return {
      message: 'Registration successful',
      access_token: token,
      user: { id: user._id, email: user.email, name: user.name },
    };
  }
}
