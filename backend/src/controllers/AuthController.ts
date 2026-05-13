import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthModel } from '../models/AuthModel';
import { validate } from '../middleware/validate';

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

export const AuthController = {
  validate: {
    register: validate(registerSchema),
    login: validate(loginSchema),
    forgotPassword: validate(forgotPasswordSchema),
    verifyOtp: validate(verifyOtpSchema),
    resetPassword: validate(resetPasswordSchema),
  },

  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthModel.register(req.body);
      res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.userId });
    } catch (err) { next(err); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await AuthModel.login(req.body);
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
};
