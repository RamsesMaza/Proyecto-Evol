import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthModel } from '../models/AuthModel';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

export const captchaField = z.string().nullable().optional();

export const registerSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio').max(100),
  lastName: z.string().min(1, 'Los apellidos son obligatorios').max(100),
  email: z.string().email('Correo inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  captchaToken: captchaField,
});

export const loginSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  captchaToken: captchaField,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo inválido'),
  captchaToken: captchaField,
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Correo inválido'),
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
  captchaToken: captchaField,
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Correo inválido'),
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  captchaToken: captchaField,
});

export const verify2faSchema = z.object({
  partialToken: z.string().min(1, 'Token requerido'),
  code: z.string().min(1, 'El código es requerido'),
  captchaToken: captchaField,
});

export const send2faOtpSchema = z.object({
  partialToken: z.string().min(1, 'Token requerido'),
  captchaToken: captchaField,
});

export const setup2faSchema = z.object({
  method: z.enum(['email', 'sms', 'authenticator'], { message: 'Método 2FA inválido' }),
  phone: z.string().optional(),
  captchaToken: captchaField,
});

export const confirm2faSchema = z.object({
  method: z.enum(['email', 'sms', 'authenticator']),
  code: z.string().min(1, 'Código requerido'),
  captchaToken: captchaField,
});

export const disable2faSchema = z.object({
  password: z.string().optional(),
  code: z.string().optional(),
  captchaToken: captchaField,
});

export const AuthController = {
  validate: {
    register: validate(registerSchema),
    login: validate(loginSchema),
    forgotPassword: validate(forgotPasswordSchema),
    verifyOtp: validate(verifyOtpSchema),
    resetPassword: validate(resetPasswordSchema),
    verify2fa: validate(verify2faSchema),
    send2faOtp: validate(send2faOtpSchema),
    setup2fa: validate(setup2faSchema),
    confirm2fa: validate(confirm2faSchema),
    disable2fa: validate(disable2faSchema),
  },

  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthModel.register(req.body);
      res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.userId });
    } catch (err) { next(err); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const result = await AuthModel.login({ ...req.body, ipAddress });
      res.status(200).json({ message: 'Inicio de sesión exitoso', ...result });
    } catch (err) { next(err); }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthModel.forgotPassword(req.body);
      res.status(200).json(result);
    } catch (err) { next(err); }
  },

  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthModel.verifyOtp(req.body);
      res.status(200).json(result);
    } catch (err) { next(err); }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthModel.resetPassword(req.body);
      res.status(200).json(result);
    } catch (err) { next(err); }
  },

  verify2fa: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const result = await AuthModel.verify2FA({ ...req.body, ipAddress });
      res.status(200).json({ message: 'Verificación exitosa', ...result });
    } catch (err) { next(err); }
  },

  send2faOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthModel.send2faOtp(req.body);
      res.status(200).json(result);
    } catch (err) { next(err); }
  },

  get2faStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await AuthModel.get2faStatus(userId);
      res.status(200).json(result);
    } catch (err) { next(err); }
  },

  setup2fa: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await AuthModel.setup2fa(userId, req.body);
      res.status(200).json(result);
    } catch (err) { next(err); }
  },

  confirm2fa: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await AuthModel.confirm2fa(userId, req.body);
      res.status(200).json(result);
    } catch (err) { next(err); }
  },

  disable2fa: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const result = await AuthModel.disable2fa(userId, req.body);
      res.status(200).json(result);
    } catch (err) { next(err); }
  },
};
