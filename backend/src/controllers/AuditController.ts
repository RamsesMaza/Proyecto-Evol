import { Request, Response, NextFunction } from 'express';
import { AuditModel } from '../models/AuditModel';

export const AuditController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, ...rest } = req.query;
      const result = await AuditModel.list({
        ...rest,
        page: Number(page) || 0,
        pageSize: Number(pageSize) || 50,
      } as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  recent: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await AuditModel.getRecent(50);
      res.json({ logs });
    } catch (err) { next(err); }
  },
};
