import { Body, Controller, Post } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class CredentialsDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: CredentialsDto) {
    return this.auth.register(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: CredentialsDto) {
    return this.auth.login(body.email, body.password);
  }
}