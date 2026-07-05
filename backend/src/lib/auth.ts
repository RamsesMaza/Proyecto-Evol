import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { logger } from './logger';

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET no está configurado');
    }
    console.warn('⚠️  JWT_SECRET no configurado. Usando fallback inseguro solo para desarrollo.');
    return 'dev_fallback_secret_do_not_use_in_production';
  }
  return secret;
})();
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

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign({ ...payload, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
};

export const generatePartialToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '5m' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
};

export const generateTotpSecret = (email: string) => {
  const secret = speakeasy.generateSecret({ name: `ACS:${email}` });
  return { base32: secret.base32, otpauthUrl: secret.otpauth_url || '' };
};

export const verifyTotp = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1,
  });
};

export const generateTotpQrCode = async (otpauthUrl: string): Promise<string> => {
  return QRCode.toDataURL(otpauthUrl);
};

export const generateBackupCodes = (count = 8): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 10).toString()
    ).join('');
    codes.push(`${code}-${Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 10).toString()
    ).join('')}`);
  }
  return codes;
};

export const verifyRecaptcha = async (token?: string | null): Promise<boolean> => {
  const isProd = process.env.NODE_ENV === 'production';

  if (!RECAPTCHA_SECRET) {
    logger.warn('RECAPTCHA_SECRET_KEY no configurada. Saltando validación.');
    return !isProd;
  }

  if (!token) {
    logger.warn('reCAPTCHA token no proporcionado.');
    return !isProd;
  }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET, response: token }).toString(),
    });

    const data = (await res.json()) as { success: boolean; score?: number };
    logger.debug({ recaptchaResponse: data }, 'reCAPTCHA verification');

    if (!data.success) return false;
    if (typeof data.score === 'number') return data.score >= 0.5;
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Error verificando reCAPTCHA');
    return false;
  }
};
