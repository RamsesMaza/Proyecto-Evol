import { Request, Response, NextFunction } from 'express';
import { UserSearchModel } from '../models/UserSearchModel';

export const UserSearchController = {
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = (req.query.q as string) || '';
      const users = await UserSearchModel.search(q);
      res.json({ users });
    } catch (err) { next(err); }
  },
};
