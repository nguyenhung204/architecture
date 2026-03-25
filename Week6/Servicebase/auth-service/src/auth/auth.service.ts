import {
  Injectable,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await firstValueFrom(
      this.userClient.send(
        { cmd: 'create_user' },
        { email: dto.email, hashedPassword, name: dto.name },
      ),
    );
    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    return {
      message: 'Registration successful',
      access_token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'find_user_by_email' }, dto.email),
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: user._id, email: user.email });
    return {
      message: 'Login successful',
      access_token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
