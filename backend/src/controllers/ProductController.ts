import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProductModel } from '../models/ProductModel';
import { validate } from '../middleware/validate';

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.coerce.number().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'oldest', 'rating', 'name']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  featured: z.enum(['true', 'false']).optional(),
  offer: z.enum(['true', 'false']).optional(),
});

export const createReviewSchema = z.object({
  userName: z.string().min(1, 'El nombre es obligatorio'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const createProductSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  name: z.string().optional(),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  oldPrice: z.number().optional(),
  categoryId: z.number().int().positive('Seleccione una categoría'),
  image: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isOffer: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  specs: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  fullDescription: z.string().optional(),
  price: z.number().min(0).optional(),
  oldPrice: z.number().nullable().optional(),
  categoryId: z.number().int().positive().optional(),
  image: z.string().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isOffer: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  specs: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
});

export const ProductController = {
  validate: {
    list: validate(productQuerySchema, 'query'),
    createReview: validate(createReviewSchema),
    create: validate(createProductSchema),
    update: validate(updateProductSchema),
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, ...rest } = req.query;
      const result = await ProductModel.list({
        ...rest,
        page: Number(page) || 1,
        limit: Number(limit) || 12,
      } as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProductModel.getById(Number(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProductModel.create(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProductModel.update(Number(req.params.id), req.body);
      res.json(result);
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProductModel.delete(Number(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  },

  createReview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProductModel.createReviewForProduct(Number(req.params.id), req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },
};
