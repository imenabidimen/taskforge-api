import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../src/auth.guard';

describe('AuthGuard', () => {
  const jwt = {
    verify: jest.fn(),
  } as unknown as JwtService;

  const guard = new AuthGuard(jwt);

  function context(authorization?: string): ExecutionContext {
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: authorization ? { authorization } : {},
    };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      request,
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects a request without a bearer token', () => {
    expect(() => guard.canActivate(context())).toThrow(UnauthorizedException);
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('rejects a non-bearer authorization header', () => {
    expect(() => guard.canActivate(context('Basic abc123'))).toThrow(
      'Bearer token required',
    );
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('rejects an invalid or expired token', () => {
    (jwt.verify as jest.Mock).mockImplementationOnce(() => {
      throw new Error('jwt expired');
    });

    expect(() => guard.canActivate(context('Bearer expired-token'))).toThrow(
      'Invalid or expired token',
    );
  });

  it('attaches the verified claims to the request', () => {
    const claims = { sub: 'user-1', email: 'dev@example.com', role: 'USER' };
    (jwt.verify as jest.Mock).mockReturnValueOnce(claims);
    const ctx = context('Bearer valid-token');

    expect(guard.canActivate(ctx)).toBe(true);
    expect((ctx as any).request.user).toEqual(claims);
    expect(jwt.verify).toHaveBeenCalledWith('valid-token');
  });
});
