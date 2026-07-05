import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, generateToken, generateAccessToken, generateRefreshToken, generatePartialToken, verifyToken, verifyTotp, generateTotpSecret, generateTotpQrCode, verifyRecaptcha } from '../lib/auth';
import { sendOtpEmail, send2faOtpEmail } from '../lib/email';
import { sendSms } from '../lib/sms';
import { AppError, ValidationError, UnauthorizedError, NotFoundError } from '../shared/errors';
import { LoginAttemptModel } from './LoginAttemptModel';

const COOLDOWN_MS = 60_000;
const OTP_EXPIRY_MS = 5 * 60_000;
const cooldowns = new Map<string, number>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
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
        status: 'nuevo',
      },
    });

    return { userId: user.id };
  },

  async login(data: { email: string; password: string; captchaToken?: string; ipAddress?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      await LoginAttemptModel.log({ email: data.email, success: false, ipAddress: data.ipAddress });
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Account lockout check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new AppError(429, `Cuenta bloqueada. Intenta de nuevo en ${remaining} minuto(s).`);
    }

    if (user.status === 'bloqueado') {
      throw new AppError(403, 'Tu cuenta está bloqueada. Contacta al administrador.');
    }

    const valid = await comparePassword(data.password, user.password);
    if (!valid) {
      await LoginAttemptModel.log({ email: data.email, userId: user.id, success: false, ipAddress: data.ipAddress });

      const attempts = user.loginAttempts + 1;
      const updateData: any = { loginAttempts: attempts };
      if (attempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.user.update({ where: { id: user.id }, data: updateData });

      const remaining = 5 - attempts;
      if (remaining <= 0) {
        throw new AppError(429, 'Demasiados intentos. Cuenta bloqueada por 15 minutos.');
      }
      throw new UnauthorizedError(`Credenciales inválidas. Te quedan ${remaining} intento(s).`);
    }

    // Reset login attempts on success
    if (user.loginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null } });
    }

    await LoginAttemptModel.log({ email: data.email, userId: user.id, success: true, ipAddress: data.ipAddress });

    if (user.twoFactorEnabled) {
      const partialToken = generatePartialToken({ userId: user.id, email: user.email, role: user.role, step: '2fa' });

      if (user.twoFactorMethod === 'email') {
        const code = generateOtp();
        const codeHash = hashOtp(code);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        await prisma.otpCode.create({
          data: { email: user.email, userId: user.id, code: codeHash, purpose: '2fa', expiresAt },
        });
        await send2faOtpEmail(user.email, code);
      } else if (user.twoFactorMethod === 'sms' && user.phone && user.phoneVerified) {
        const code = generateOtp();
        const codeHash = hashOtp(code);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

        await prisma.otpCode.create({
          data: { email: user.email, userId: user.id, phone: user.phone, code: codeHash, purpose: '2fa', expiresAt },
        });
        await sendSms(user.phone, `Tu código de verificación ACS es: ${code}. Válido por 5 minutos.`);
      }

      return { requires2FA: true, method: user.twoFactorMethod, partialToken, email: user.email };
    }

    const payload = { userId: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.userSession.create({
      data: { userId: user.id, token: refreshToken, isActive: true },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id, email: user.email, firstName: user.firstName,
        lastName: user.lastName, phone: user.phone, company: user.company, role: user.role,
      },
    };
  },

  async send2faOtp(data: { partialToken: string; captchaToken?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    let payload: any;
    try { payload = verifyToken(data.partialToken); }
    catch { throw new UnauthorizedError('Sesión expirada. Inicia sesión nuevamente.'); }

    if (payload.step !== '2fa') throw new ValidationError('Token inválido');

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.twoFactorEnabled) throw new ValidationError('2FA no está habilitado');

    const key = `2fa_cooldown:${user.id}`;
    const lastSent = cooldowns.get(key);
    if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      throw new AppError(429, `Debes esperar ${remaining} segundos para reenviar el código`);
    }

    if (user.twoFactorMethod === 'email') {
      const code = generateOtp();
      const codeHash = hashOtp(code);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

      await prisma.otpCode.create({
        data: { email: user.email, userId: user.id, code: codeHash, purpose: '2fa', expiresAt },
      });
      await send2faOtpEmail(user.email, code);
    } else if (user.twoFactorMethod === 'sms' && user.phone && user.phoneVerified) {
      const code = generateOtp();
      const codeHash = hashOtp(code);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

      await prisma.otpCode.create({
        data: { email: user.email, userId: user.id, phone: user.phone, code: codeHash, purpose: '2fa', expiresAt },
      });
      await sendSms(user.phone, `Tu código de verificación ACS es: ${code}. Válido por 5 minutos.`);
    }

    cooldowns.set(key, Date.now());
    return { message: 'Código reenviado correctamente' };
  },

  async verify2FA(data: { partialToken: string; code: string; captchaToken?: string; ipAddress?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    let payload: any;
    try { payload = verifyToken(data.partialToken); }
    catch { throw new UnauthorizedError('La sesión ha expirado. Inicia sesión nuevamente.'); }

    if (payload.step !== '2fa') throw new ValidationError('Token inválido');

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new UnauthorizedError('Usuario no encontrado');
    if (!user.twoFactorEnabled) throw new ValidationError('2FA no está habilitado');

    if (user.twoFactorMethod === 'authenticator') {
      if (!user.twoFactorSecret) throw new ValidationError('2FA no configurado correctamente');
      const isValid = verifyTotp(data.code, user.twoFactorSecret);
      if (!isValid) throw new ValidationError('Código inválido. Intenta nuevamente.');
    } else {
      const otpRecord = await prisma.otpCode.findFirst({
        where: { userId: user.id, purpose: '2fa', usedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) throw new ValidationError('No hay un código pendiente. Solicita uno nuevo.');
      if (new Date() > otpRecord.expiresAt) throw new ValidationError('El código ha expirado. Solicita uno nuevo.');
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        throw new AppError(429, 'Demasiados intentos. Inicia sesión nuevamente.');
      }

      const codeHash = hashOtp(data.code);
      if (otpRecord.code !== codeHash) {
        await prisma.otpCode.update({
          where: { id: otpRecord.id },
          data: { attempts: { increment: 1 } },
        });
        const remaining = otpRecord.maxAttempts - otpRecord.attempts - 1;
        throw new ValidationError(`Código incorrecto. Te quedan ${remaining} intento(s).`);
      }

      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      });
      await prisma.otpCode.updateMany({
        where: { userId: user.id, purpose: '2fa', usedAt: null },
        data: { usedAt: new Date() },
      });
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.userSession.create({
      data: { userId: user.id, token: refreshToken, isActive: true },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id, email: user.email, firstName: user.firstName,
        lastName: user.lastName, phone: user.phone, company: user.company, role: user.role,
      },
    };
  },

  async get2faStatus(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true, twoFactorMethod: true, phone: true, phoneVerified: true },
    });
    if (!user) throw new NotFoundError('Usuario');
    return user;
  },

  async setup2fa(userId: number, data: { method: 'email' | 'sms' | 'authenticator'; phone?: string; captchaToken?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Usuario');

    if (data.method === 'sms') {
      if (!data.phone) throw new ValidationError('Número de teléfono requerido para SMS');
      const phoneRegex = /^\+?[1-9]\d{7,14}$/;
      if (!phoneRegex.test(data.phone.replace(/[\s()-]/g, ''))) {
        throw new ValidationError('Formato de número inválido. Usa formato internacional: +51999999999');
      }
      const cleanPhone = data.phone.replace(/[\s()-]/g, '');

      await prisma.user.update({ where: { id: userId }, data: { phone: cleanPhone, phoneVerified: false, twoFactorMethod: 'sms' } });

      const code = generateOtp();
      const codeHash = hashOtp(code);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
      await prisma.otpCode.create({
        data: { userId, phone: cleanPhone, code: codeHash, purpose: 'phone_verification', expiresAt },
      });
      await sendSms(cleanPhone, `Tu código de verificación ACS es: ${code}. Válido por 5 minutos.`);

      return { message: 'Código de verificación enviado al teléfono', requiresPhoneVerification: true };
    }

    if (data.method === 'email') {
      const code = generateOtp();
      const codeHash = hashOtp(code);
      const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

      await prisma.otpCode.create({
        data: { userId, code: codeHash, purpose: '2fa_setup', expiresAt },
      });
      await send2faOtpEmail(user.email, code);

      await prisma.user.update({ where: { id: userId }, data: { twoFactorMethod: 'email' } });
      return { message: 'Código de verificación enviado a tu correo' };
    }

    if (data.method === 'authenticator') {
      const secret = generateTotpSecret(user.email);
      const qrCode = await generateTotpQrCode(secret.otpauthUrl);
      await prisma.user.update({
        where: { id: userId },
        data: { twoFactorSecret: secret.base32, twoFactorMethod: 'authenticator' },
      });
      return { secret: secret.base32, qrCode };
    }

    throw new ValidationError('Método 2FA inválido');
  },

  async confirm2fa(userId: number, data: { code: string; method: string; captchaToken?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Usuario');

    if (data.method === 'authenticator') {
      if (!user.twoFactorSecret) throw new ValidationError('Primero configura 2FA con authenticator');
      const isValid = verifyTotp(data.code, user.twoFactorSecret);
      if (!isValid) throw new ValidationError('Código inválido. Escanea el código QR nuevamente.');
    } else if (data.method === 'email') {
      const otpRecord = await prisma.otpCode.findFirst({
        where: { userId, purpose: '2fa_setup', usedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      if (!otpRecord) throw new ValidationError('No hay un código pendiente. Solicita uno nuevo.');
      if (new Date() > otpRecord.expiresAt) throw new ValidationError('El código ha expirado. Solicita uno nuevo.');
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        throw new AppError(429, 'Demasiados intentos. Solicita un nuevo código.');
      }
      const codeHash = hashOtp(data.code);
      if (otpRecord.code !== codeHash) {
        await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } });
        throw new ValidationError('Código incorrecto.');
      }
      await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { usedAt: new Date() } });
    } else if (data.method === 'sms') {
      const otpRecord = await prisma.otpCode.findFirst({
        where: { userId, purpose: 'phone_verification', usedAt: null },
        orderBy: { createdAt: 'desc' },
      });
      if (!otpRecord) throw new ValidationError('No hay un código pendiente. Solicita uno nuevo.');
      if (new Date() > otpRecord.expiresAt) throw new ValidationError('El código ha expirado. Solicita uno nuevo.');
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        throw new AppError(429, 'Demasiados intentos. Solicita un nuevo código.');
      }
      const codeHash = hashOtp(data.code);
      if (otpRecord.code !== codeHash) {
        await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { attempts: { increment: 1 } } });
        throw new ValidationError('Código incorrecto.');
      }
      await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { usedAt: new Date() } });
      await prisma.user.update({ where: { id: userId }, data: { phoneVerified: true } });
    }

    await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });

    return { message: 'Autenticación de dos factores activada correctamente' };
  },

  async disable2fa(userId: number, data: { code?: string; password?: string; captchaToken?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('Usuario');

    if (data.password) {
      const valid = await comparePassword(data.password, user.password);
      if (!valid) throw new ValidationError('Contraseña incorrecta');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return { message: 'Autenticación de dos factores desactivada' };
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
    const codeHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await prisma.otpCode.create({ data: { email: data.email, code: codeHash, purpose: 'password_reset', expiresAt } });
    await sendOtpEmail(data.email, code);
    cooldowns.set(key, Date.now());

    return { message: 'Código de recuperación enviado a tu correo' };
  },

  async verifyOtp(data: { email: string; code: string; captchaToken?: string }) {
    const isHuman = await verifyRecaptcha(data.captchaToken);
    if (!isHuman) throw new ValidationError('Validación de reCAPTCHA fallida');

    const otpRecord = await prisma.otpCode.findFirst({
      where: { email: data.email, purpose: 'password_reset', usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new ValidationError('No hay un código pendiente. Solicita uno nuevo.');
    if (new Date() > otpRecord.expiresAt) throw new ValidationError('El código ha expirado. Solicita uno nuevo.');
    if (otpRecord.attempts >= otpRecord.maxAttempts) throw new AppError(429, 'Demasiados intentos. Solicita un nuevo código.');

    const codeHash = hashOtp(data.code);
    if (otpRecord.code !== codeHash) {
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
      where: { email: data.email, purpose: 'password_reset', usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new ValidationError('No hay un código pendiente. Solicita uno nuevo.');
    if (new Date() > otpRecord.expiresAt) throw new ValidationError('El código ha expirado. Solicita uno nuevo.');
    if (otpRecord.attempts >= otpRecord.maxAttempts) throw new AppError(429, 'Demasiados intentos. Solicita un nuevo código.');

    const codeHash = hashOtp(data.code);
    if (otpRecord.code !== codeHash) {
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
    await prisma.otpCode.updateMany({
      where: { email: data.email, purpose: 'password_reset', usedAt: null },
      data: { usedAt: new Date() },
    });

    return { message: 'Contraseña actualizada correctamente' };
  },

  async refresh(refreshTokenStr: string) {
    let payload: any;
    try {
      payload = verifyToken(refreshTokenStr);
    } catch {
      throw new UnauthorizedError('Sesión expirada. Inicia sesión nuevamente.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Token de refresco inválido.');
    }

    // Verify it exists in DB (allows revocation)
    const session = await prisma.userSession.findFirst({
      where: { token: refreshTokenStr, isActive: true, userId: payload.userId },
    });
    if (!session) {
      throw new UnauthorizedError('Sesión no encontrada. Inicia sesión nuevamente.');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new UnauthorizedError('Usuario no encontrado.');
    if (user.status === 'bloqueado') {
      throw new AppError(403, 'Tu cuenta está bloqueada. Contacta al administrador.');
    }

    // Rotate refresh token (revoke old, create new)
    const newPayload = { userId: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName };
    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    await prisma.userSession.update({
      where: { id: session.id },
      data: { token: newRefreshToken, lastActivity: new Date() },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id, email: user.email, firstName: user.firstName,
        lastName: user.lastName, phone: user.phone, company: user.company, role: user.role,
      },
    };
  },

  async logout(refreshTokenStr?: string) {
    if (!refreshTokenStr) return;
    await prisma.userSession.updateMany({
      where: { token: refreshTokenStr, isActive: true },
      data: { isActive: false },
    });
  },

  async getUserById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  },
};
