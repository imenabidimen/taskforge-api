import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../src/auth.service';
describe('AuthService',()=>{it('registers and returns a token',async()=>{const m=await Test.createTestingModule({imports:[JwtModule.register({secret:'test'})],providers:[AuthService]}).compile();const s=m.get(AuthService);const r=await s.register('dev@example.com','password123');expect(r.accessToken).toEqual(expect.any(String));expect(r.user.email).toBe('dev@example.com');});});