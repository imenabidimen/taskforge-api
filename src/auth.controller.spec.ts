import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CredentialsDto } from './auth.controller';

describe('CredentialsDto', () => {
  async function errorsFor(password: string) {
    const dto = plainToInstance(CredentialsDto, {
      email: 'DEV@example.com',
      password,
    });
    return validate(dto);
  }

  it('accepts a password within bcrypt’s 72-byte limit', async () => {
    expect(await errorsFor('a'.repeat(72))).toHaveLength(0);
  });

  it('rejects passwords exceeding bcrypt’s 72-byte limit', async () => {
    const errors = await errorsFor('a'.repeat(73));
    expect(errors.find((error) => error.property === 'password')?.constraints)
      .toHaveProperty('maxBcryptPasswordBytes');
  });

  it('counts UTF-8 bytes rather than only visible characters', async () => {
    const errors = await errorsFor('🙂'.repeat(19));
    expect(errors.find((error) => error.property === 'password')?.constraints)
      .toHaveProperty('maxBcryptPasswordBytes');
  });

  it('normalizes email addresses before validation', async () => {
    const dto = plainToInstance(CredentialsDto, {
      email: ' DEV@EXAMPLE.COM ',
      password: 'password123',
    });
    expect(dto.email).toBe('dev@example.com');
    expect(await validate(dto)).toHaveLength(0);
  });
});
