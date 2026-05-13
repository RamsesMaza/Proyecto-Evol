import { Request, Response, NextFunction } from 'express';
import { CategoryModel } from '../models/CategoryModel';

export const CategoryController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await CategoryModel.list();
      res.json(result);
    } catch (err) { next(err); }
  },
};
