import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly users = new Map<string, { id: string; email: string; password: string; role: 'USER'|'ADMIN' }>();
  constructor(private readonly jwt: JwtService) {}

  async register(email: string, password: string) {
    if (this.users.has(email)) throw new UnauthorizedException('Email already registered');
    const user = { id: crypto.randomUUID(), email, password: await bcrypt.hash(password, 12), role: 'USER' as const };
    this.users.set(email, user);
    return this.tokens(user);
  }
  async login(email: string, password: string) {
    const user = this.users.get(email);
    if (!user || !(await bcrypt.compare(password, user.password))) throw new UnauthorizedException('Invalid credentials');
    return this.tokens(user);
  }
  private tokens(user: {id:string;email:string;role:string}) {
    return { accessToken: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }), user: { id:user.id, email:user.email, role:user.role } };
  }
}
