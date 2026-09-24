import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/auth.service';

describe('AuthService', () => {
  function service() {
    const users = new Map<string, any>();
    const prisma = {
      user: {
        findUnique: jest.fn(({ where }: any) => Promise.resolve(users.get(where.email) ?? null)),
        create: jest.fn(({ data }: any) => {
          const user = { id: crypto.randomUUID(), ...data };
          users.set(user.email, user);
          return Promise.resolve(user);
        }),
      },
    };
    return new AuthService(new JwtService({ secret: 'test' }), prisma as any);
  }

  it('registers and returns a safe user payload', async () => {
    const r = await service().register('dev@example.com', 'password123');
    expect(r.accessToken).toEqual(expect.any(String));
    expect(r.user).toEqual({ id: expect.any(String), email: 'dev@example.com', role: 'USER' });
    expect(r.user).not.toHaveProperty('passwordHash');
  });

  it('logs in with the password that was registered', async () => {
    const s = service();
    await s.register('dev@example.com', 'password123');
    const r = await s.login('dev@example.com', 'password123');
    expect(r.accessToken).toEqual(expect.any(String));
  });

  it('rejects invalid credentials', async () => {
    const s = service();
    await s.register('dev@example.com', 'password123');
    await expect(s.login('dev@example.com', 'wrong-password')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('does not allow a duplicate registration', async () => {
    const s = service();
    await s.register('dev@example.com', 'password123');
    await expect(s.register('dev@example.com', 'password123')).rejects.toThrow('Email already registered');
  });
});