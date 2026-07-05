import { Request, Response, NextFunction } from 'express';
import { NotificationModel } from '../models/NotificationModel';

export const NotificationController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, page, pageSize } = req.query;
      const result = await NotificationModel.list({
        type: type as string, page: Number(page) || 0, pageSize: Number(pageSize) || 50,
      });
      res.json(result);
    } catch (err) { next(err); }
  },

  getMyNotifications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, read, page, pageSize } = req.query;
      const result = await NotificationModel.list({
        userId: req.user?.userId, type: type as string,
        read: read !== undefined ? read === 'true' : undefined,
        page: Number(page) || 0, pageSize: Number(pageSize) || 50,
      });
      res.json(result);
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await NotificationModel.create(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  markRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await NotificationModel.markRead(Number(req.params.id));
      res.json({ message: 'Notificación marcada como leída' });
    } catch (err) { next(err); }
  },

  markAllRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.userId) { res.status(401).json({ error: 'No autenticado' }); return; }
      await NotificationModel.markAllRead(req.user.userId);
      res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await NotificationModel.delete(Number(req.params.id));
      res.json({ message: 'Notificación eliminada' });
    } catch (err) { next(err); }
  },

  unreadCount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await NotificationModel.getUnreadCount(req.user?.userId);
      res.json({ count });
    } catch (err) { next(err); }
  },
};
