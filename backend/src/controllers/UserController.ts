import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserModel } from '../models/UserModel';
import { validate } from '../middleware/validate';

export const listUsersSchema = z.object({
  query: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(0).optional().default(0),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(50),
  sortField: z.string().optional().default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const updateUserSchema = z.object({
  status: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export const UserController = {
  validate: {
    list: validate(listUsersSchema, 'query'),
    update: validate(updateUserSchema),
    updateProfile: validate(updateProfileSchema),
  },

  listClientes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, ...rest } = req.query;
      const result = await UserModel.listByRole('USER', {
        ...rest,
        page: Number(page) || 0,
        pageSize: Number(pageSize) || 50,
      } as any);
      res.json({
        clientes: result.users.map((u: any) => ({
          id: String(u.id),
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone || '',
          company: u.company || '',
          status: u.status,
          isFavorite: u.isFavorite,
          createdAt: u.createdAt.toISOString().split('T')[0],
          updatedAt: u.updatedAt.toISOString().split('T')[0],
          totalCompras: 0,
          totalGastado: 0,
          ultimaCompra: null,
          activity: [],
          cotizaciones: [],
          notas: [],
        })),
        total: result.total,
      });
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.update(Number(req.params.id), req.body);
      res.json({
        id: String(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        company: user.company || '',
        status: user.status,
        isFavorite: user.isFavorite,
      });
    } catch (err) { next(err); }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }
      const user = await UserModel.updateProfile(Number(userId), req.body);
      res.json({
        id: String(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        company: user.company || '',
      });
    } catch (err) { next(err); }
  },

  stats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await UserModel.getStats();
      res.json(result);
    } catch (err) { next(err); }
  },
};
