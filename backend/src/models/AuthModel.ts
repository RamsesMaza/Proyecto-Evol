import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, generateToken, verifyRecaptcha } from '../lib/auth';
import { sendOtpEmail } from '../lib/email';
import { AppError, ValidationError, UnauthorizedError } from '../shared/errors';

const COOLDOWN_MS = 60_000;
const OTP_EXPIRY_MS = 5 * 60_000;
const cooldowns = new Map<string, number>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const AuthModel = {
  async register(data: {
    firstName: string; lastName: string; email: string;
    phone?: string; company?: string; password: string; captchaToken?: string;
  }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ValidationError('El correo ya está registrado');

    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName, lastName: data.lastName, email: data.email,
        phone: data.phone, company: data.company, password: hashedPassword,
      },
    });

    return { userId: user.id };
  },

  async login(data: { email: string; password: string; captchaToken?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new UnauthorizedError('Credenciales inválidas');

    const valid = await comparePassword(data.password, user.password);
    if (!valid) throw new UnauthorizedError('Credenciales inválidas');

    const token = generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id, email: user.email, firstName: user.firstName,
        lastName: user.lastName, phone: user.phone, company: user.company,
      },
    };
  },

  async forgotPassword(data: { email: string; captchaToken?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return { message: 'Si el correo existe, recibirás un código de recuperación' };

    const key = `otp_cooldown:${data.email}`;
    const lastSent = cooldowns.get(key);
    if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      throw new AppError(429, `Debes esperar ${remaining} segundos antes de solicitar un nuevo código`);
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await prisma.otpCode.create({ data: { email: data.email, code, expiresAt } });
    await sendOtpEmail(data.email, code);
    cooldowns.set(key, Date.now());

    return { message: 'Código de recuperación enviado a tu correo' };
  },

  async verifyOtp(data: { email: string; code: string; captchaToken?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const otpRecord = await prisma.otpCode.findFirst({
      where: { email: data.email, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new ValidationError('No hay un código pendiente. Solicita uno nuevo.');
    if (new Date() > otpRecord.expiresAt) throw new ValidationError('El código ha expirado. Solicita uno nuevo.');
    if (otpRecord.attempts >= otpRecord.maxAttempts) throw new AppError(429, 'Demasiados intentos. Solicita un nuevo código.');

    if (otpRecord.code !== data.code) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = otpRecord.maxAttempts - otpRecord.attempts - 1;
      throw new ValidationError(`Código incorrecto. Te quedan ${remaining} intento(s).`);
    }

    return { message: 'Código verificado correctamente' };
  },

  async resetPassword(data: { email: string; code: string; newPassword: string; captchaToken?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const otpRecord = await prisma.otpCode.findFirst({
      where: { email: data.email, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new ValidationError('No hay un código pendiente. Solicita uno nuevo.');
    if (new Date() > otpRecord.expiresAt) throw new ValidationError('El código ha expirado. Solicita uno nuevo.');
    if (otpRecord.attempts >= otpRecord.maxAttempts) throw new AppError(429, 'Demasiados intentos. Solicita un nuevo código.');

    if (otpRecord.code !== data.code) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = otpRecord.maxAttempts - otpRecord.attempts - 1;
      throw new ValidationError(`Código incorrecto. Te quedan ${remaining} intento(s).`);
    }

    const hashedPassword = await hashPassword(data.newPassword);
    await prisma.user.update({ where: { email: data.email }, data: { password: hashedPassword } });
    await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { usedAt: new Date() } });
    await prisma.otpCode.updateMany({ where: { email: data.email, usedAt: null }, data: { usedAt: new Date() } });

    return { message: 'Contraseña actualizada correctamente' };
  },
};
