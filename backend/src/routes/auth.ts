import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, generateToken, verifyRecaptcha } from '../lib/auth';
import { sendOtpEmail } from '../lib/email';

const router = Router();

const COOLDOWN_MS = 60_000;
const OTP_EXPIRY_MS = 5 * 60_000;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cooldownKey(email: string): string {
  return `otp_cooldown:${email}`;
}

const cooldowns = new Map<string, number>();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, company, password, captchaToken } = req.body;

    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
      res.status(400).json({ error: 'Validación de reCAPTCHA fallida' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'El correo ya está registrado' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { firstName, lastName, email, phone, company, password: hashedPassword },
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: user.id });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, captchaToken } = req.body;

    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
      res.status(400).json({ error: 'Validación de reCAPTCHA fallida' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, company: user.company },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email, captchaToken } = req.body;

    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
      res.status(400).json({ error: 'Validación de reCAPTCHA fallida' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(200).json({ message: 'Si el correo existe, recibirás un código de recuperación' });
      return;
    }

    const lastSent = cooldowns.get(cooldownKey(email));
    if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      res.status(429).json({ error: `Debes esperar ${remaining} segundos antes de solicitar un nuevo código` });
      return;
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await prisma.otpCode.create({
      data: { email, code, expiresAt },
    });

    try {
      await sendOtpEmail(email, code);
    } catch (emailError) {
      console.error('Error enviando email:', emailError);
      res.status(500).json({ error: 'Error al enviar el correo. Intenta más tarde.' });
      return;
    }

    cooldowns.set(cooldownKey(email), Date.now());

    console.log(`\n[OTP para ${email}]: ${code}\n`);

    res.status(200).json({ message: 'Código de recuperación enviado a tu correo' });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, code, captchaToken } = req.body;

    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
      res.status(400).json({ error: 'Validación de reCAPTCHA fallida' });
      return;
    }

    if (!email || !code) {
      res.status(400).json({ error: 'Correo y código son requeridos' });
      return;
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: { email, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      res.status(400).json({ error: 'No hay un código pendiente para este correo. Solicita uno nuevo.' });
      return;
    }

    if (new Date() > otpRecord.expiresAt) {
      res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
      return;
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      res.status(429).json({ error: 'Demasiados intentos. Solicita un nuevo código.' });
      return;
    }

    if (otpRecord.code !== code) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = otpRecord.maxAttempts - otpRecord.attempts - 1;
      res.status(400).json({
        error: `Código incorrecto. Te quedan ${remaining} intento(s).`,
      });
      return;
    }

    res.status(200).json({
      message: 'Código verificado correctamente',
    });
  } catch (error) {
    console.error('Error en verify-otp:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword, captchaToken } = req.body;

    const isHuman = await verifyRecaptcha(captchaToken);
    if (!isHuman) {
      res.status(400).json({ error: 'Validación de reCAPTCHA fallida' });
      return;
    }

    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      return;
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: { email, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      res.status(400).json({ error: 'No hay un código pendiente. Solicita uno nuevo.' });
      return;
    }

    if (new Date() > otpRecord.expiresAt) {
      res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
      return;
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      res.status(429).json({ error: 'Demasiados intentos. Solicita un nuevo código.' });
      return;
    }

    if (otpRecord.code !== code) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      const remaining = otpRecord.maxAttempts - otpRecord.attempts - 1;
      res.status(400).json({
        error: `Código incorrecto. Te quedan ${remaining} intento(s).`,
      });
      return;
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    await prisma.otpCode.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });

    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
