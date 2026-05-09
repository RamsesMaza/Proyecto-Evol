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

export const verifyRecaptcha = async (token: string): Promise<boolean> => {
  if (!RECAPTCHA_SECRET) {
    console.warn('RECAPTCHA_SECRET_KEY no configurada. Saltando validación de reCAPTCHA.');
    return true; // En modo desarrollo si no hay key, lo dejamos pasar.
  }

  try {
    const res = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET,
        response: token
      }).toString(),
    });
    
    const data = (await res.json()) as { success: boolean; score: number };
    console.log('reCAPTCHA verification response:', data);
    return data.success && data.score >= 0.5; // Score >= 0.5 significa que probablemente es humano
  } catch (error) {
    console.error('Error verificando reCAPTCHA:', error);
    return false;
  }
};
