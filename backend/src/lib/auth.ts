import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY || '';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyRecaptcha = async (token?: string | null): Promise<boolean> => {
  if (!token || !RECAPTCHA_SECRET) {
    if (!token) console.warn('reCAPTCHA token no proporcionado. Saltando validación.');
    if (!RECAPTCHA_SECRET) console.warn('RECAPTCHA_SECRET_KEY no configurada. Saltando validación.');
    return true;
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET, response: token }).toString(),
    });

    const data = (await res.json()) as { success: boolean; score?: number };
    console.log('[reCAPTCHA]', JSON.stringify(data));

    if (!data.success) return false;
    if (typeof data.score === 'number') return data.score >= 0.5;
    return true;
  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error);
    return false;
  }
};
