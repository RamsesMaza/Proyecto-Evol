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

export const ProductController = {
  validate: {
    list: validate(productQuerySchema, 'query'),
    createReview: validate(createReviewSchema),
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProductModel.list(req.query as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await ProductModel.getById(Number(req.params.id));
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
