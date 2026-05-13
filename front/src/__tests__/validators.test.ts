import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword } from '../utils/validators';

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user@domain.co')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should accept strong passwords', () => {
    const result = validatePassword('MyPassword1');
    expect(result.isValid).toBe(true);
  });

  it('should reject short passwords', () => {
    const result = validatePassword('Ab1');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('8 caracteres');
  });

  it('should reject passwords without uppercase', () => {
    const result = validatePassword('mypassword1');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('mayúscula');
  });

  it('should reject passwords without number', () => {
    const result = validatePassword('MyPassword');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('número');
  });
});
