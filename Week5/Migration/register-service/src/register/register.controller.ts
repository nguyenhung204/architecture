import { Body, Controller, Post } from '@nestjs/common';
import { RegisterService } from './register.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller('auth')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerService.register(dto);
  }
}
