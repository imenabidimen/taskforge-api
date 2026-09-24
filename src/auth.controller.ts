import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
class Credentials { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; }
@Controller('auth') export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() body: Credentials) { return this.auth.register(body.email, body.password); }
  @Post('login') login(@Body() body: Credentials) { return this.auth.login(body.email, body.password); }
}
