import { Request, Response, NextFunction } from 'express';
import { SystemSettingModel } from '../models/SystemSettingModel';

export const SystemSettingController = {
  getAll: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await SystemSettingModel.getAll();
      res.json({ settings });
    } catch (err) { next(err); }
  },

  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = String(req.params.key);
      const value = await SystemSettingModel.get(key);
      res.json({ key, value });
    } catch (err) { next(err); }
  },

  set: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key, value } = req.body;
      await SystemSettingModel.set(key, value);
      res.json({ message: 'Configuración guardada' });
    } catch (err) { next(err); }
  },

  setMany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await SystemSettingModel.setMany(req.body);
      res.json({ settings, message: 'Configuraciones guardadas' });
    } catch (err) { next(err); }
  },
};
