import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '../controllers/AuthController';

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const result = registerSchema.safeParse({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        password: 'MyPassword123',
        captchaToken: 'abc123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing firstName', () => {
      const result = registerSchema.safeParse({
        lastName: 'Pérez',
        email: 'juan@example.com',
        password: 'MyPassword123',
        captchaToken: 'abc123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        password: '123',
        captchaToken: 'abc123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'not-an-email',
        password: 'MyPassword123',
        captchaToken: 'abc123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const result = loginSchema.safeParse({
        email: 'juan@example.com',
        password: 'MyPassword123',
        captchaToken: 'abc123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing email', () => {
      const result = loginSchema.safeParse({
        password: 'MyPassword123',
        captchaToken: 'abc123',
      });
      expect(result.success).toBe(false);
    });
  });
});
