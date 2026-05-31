import { Request, Response, NextFunction } from 'express';
import { LoginAttemptModel } from '../models/LoginAttemptModel';

export const LoginAttemptController = {
  list: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const attempts = await LoginAttemptModel.getRecent(100);
      res.json({ attempts });
    } catch (err) { next(err); }
  },

  stats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await LoginAttemptModel.getStats();
      res.json(stats);
    } catch (err) { next(err); }
  },
};
