import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/UserModel';
import { AuditModel } from '../models/AuditModel';
import { LoginAttemptModel } from '../models/LoginAttemptModel';
import { SupportTicketModel } from '../models/SupportTicketModel';
import { PermissionModel } from '../models/PermissionModel';

export const TiDashboardController = {
  stats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const [userStats, loginStats, ticketStats, audits] = await Promise.all([
        UserModel.getTiStats(),
        LoginAttemptModel.getStats(),
        SupportTicketModel.getStats(),
        AuditModel.getRecent(10),
      ]);
      res.json({ ...userStats, loginStats, ticketStats, recentActivity: audits });
    } catch (err) { next(err); }
  },

  sessions: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const sessions = await UserModel.getSessions(true);
      res.json({ sessions, total: sessions.length });
    } catch (err) { next(err); }
  },

  closeSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await UserModel.closeSession(Number(req.params.id));
      res.json({ message: 'Sesión cerrada' });
    } catch (err) { next(err); }
  },

  permissions: {
    list: async (_req: Request, res: Response, next: NextFunction) => {
      try {
        const permissions = await PermissionModel.list();
        res.json({ permissions });
      } catch (err) { next(err); }
    },

    getRolePermissions: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const permissions = await PermissionModel.getRolePermissions(String(req.params.role));
        res.json({ permissions });
      } catch (err) { next(err); }
    },

    assign: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { role, permissionId } = req.body;
        await PermissionModel.assignPermission(role, permissionId);
        res.json({ message: 'Permiso asignado' });
      } catch (err) { next(err); }
    },

    remove: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { role, permissionId } = req.body;
        await PermissionModel.removePermission(role, permissionId);
        res.json({ message: 'Permiso removido' });
      } catch (err) { next(err); }
    },

    create: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const perm = await PermissionModel.create(req.body);
        res.status(201).json(perm);
      } catch (err) { next(err); }
    },
  },
};
