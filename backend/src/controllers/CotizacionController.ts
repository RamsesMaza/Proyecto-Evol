import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CotizacionModel } from '../models/CotizacionModel';
import { validate } from '../middleware/validate';

export const createCotizacionSchema = z.object({
  clienteId: z.number().int().optional(),
  clienteNombre: z.string().min(1, 'El nombre del cliente es obligatorio'),
  clienteEmail: z.string().email('Correo inválido'),
  clientePhone: z.string().optional(),
  clienteCompany: z.string().optional(),
  vendedorNombre: z.string().optional(),
  vencimiento: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
  notas: z.string().optional(),
  terminos: z.string().optional(),
  metodoPago: z.string().optional(),
  descuento: z.number().min(0).optional().default(0),
  impuesto: z.number().min(0).optional().default(18),
  estado: z.string().optional(),
  items: z.array(z.object({
    producto: z.string().min(1, 'El producto es obligatorio'),
    descripcion: z.string().optional(),
    cantidad: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
    precioUnit: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
    descuento: z.number().min(0).optional().default(0),
  })).min(1, 'Agrega al menos un producto'),
});

export const updateCotizacionSchema = z.object({
  clienteNombre: z.string().min(1).optional(),
  clienteEmail: z.string().email().optional(),
  clientePhone: z.string().optional(),
  clienteCompany: z.string().optional(),
  vencimiento: z.string().optional(),
  notas: z.string().optional(),
  terminos: z.string().optional(),
  metodoPago: z.string().optional(),
  descuento: z.number().min(0).optional(),
  impuesto: z.number().min(0).optional(),
  estado: z.string().optional(),
  items: z.array(z.object({
    producto: z.string().min(1),
    descripcion: z.string().optional(),
    cantidad: z.number().int().min(1),
    precioUnit: z.number().min(0),
    descuento: z.number().min(0).optional().default(0),
  })).optional(),
});

export const listCotizacionesSchema = z.object({
  query: z.string().optional(),
  estado: z.string().optional(),
  page: z.coerce.number().int().min(0).optional().default(0),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortField: z.string().optional().default('fecha'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const CotizacionController = {
  validate: {
    list: validate(listCotizacionesSchema, 'query'),
    create: validate(createCotizacionSchema),
    update: validate(updateCotizacionSchema),
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, ...rest } = req.query;
      res.json(await CotizacionModel.list({
        ...rest,
        page: Number(page) || 0,
        pageSize: Number(pageSize) || 50,
      } as any));
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await CotizacionModel.getById(Number(req.params.id))); }
    catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      const data = { ...req.body, vendedorId: user?.userId, vendedorNombre: user ? `${user.firstName} ${user.lastName}` : undefined };
      res.status(201).json(await CotizacionModel.create(data));
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await CotizacionModel.update(Number(req.params.id), req.body)); }
    catch (err) { next(err); }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { estado } = req.body;
      const user = (req as any).user;
      res.json(await CotizacionModel.updateStatus(Number(req.params.id), estado, user ? `${user.firstName} ${user.lastName}` : undefined));
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await CotizacionModel.delete(Number(req.params.id))); }
    catch (err) { next(err); }
  },

  stats: async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await CotizacionModel.getStats()); }
    catch (err) { next(err); }
  },
};
