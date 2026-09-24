import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth.service';

describe('AuthService', () => {
  async function service() {
    const m = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test' })],
      providers: [AuthService],
    }).compile();
    return m.get(AuthService);
  }

  it('registers and returns a safe user payload', async () => {
    const s = await service();
    const r = await s.register('dev@example.com', 'password123');
    expect(r.accessToken).toEqual(expect.any(String));
    expect(r.user).toEqual({ id: expect.any(String), email: 'dev@example.com', role: 'USER' });
    expect(r.user).not.toHaveProperty('password');
  });

  it('logs in with the password that was registered', async () => {
    const s = await service();
    await s.register('dev@example.com', 'password123');
    const r = await s.login('dev@example.com', 'password123');
    expect(r.accessToken).toEqual(expect.any(String));
  });

  it('rejects invalid credentials', async () => {
    const s = await service();
    await s.register('dev@example.com', 'password123');
    await expect(s.login('dev@example.com', 'wrong-password')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('does not allow a duplicate registration', async () => {
    const s = await service();
    await s.register('dev@example.com', 'password123');
    await expect(s.register('dev@example.com', 'password123')).rejects.toThrow('Email already registered');
  });
});