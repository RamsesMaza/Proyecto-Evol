import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/UserModel';
import { AuditModel } from '../models/AuditModel';

export const TiUserController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, ...rest } = req.query;
      const result = await UserModel.listAll({
        ...rest,
        page: Number(page) || 0,
        pageSize: Number(pageSize) || 50,
      } as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await UserModel.getById(Number(req.params.id));
      if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
      res.json(user);
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await UserModel.listAll({ query: req.body.email, pageSize: 1 });
      if (existing.total > 0) {
        res.status(400).json({ error: 'El email ya está registrado' });
        return;
      }
      const user = await UserModel.createUser(req.body);
      await AuditModel.log({
        userId: (req as any).user?.userId,
        userEmail: (req as any).user?.email,
        userName: `${(req as any).user?.firstName} ${(req as any).user?.lastName}`,
        action: 'CREAR_USUARIO',
        entity: 'User',
        entityId: String(user.id),
        description: `Creó el usuario ${user.firstName} ${user.lastName} (${user.email})`,
        ipAddress: req.ip,
        newValues: user,
      });
      res.status(201).json(user);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const oldUser = await UserModel.getById(Number(req.params.id));
      if (!oldUser) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
      const user = await UserModel.updateUser(Number(req.params.id), req.body);
      await AuditModel.log({
        userId: (req as any).user?.userId,
        userEmail: (req as any).user?.email,
        userName: `${(req as any).user?.firstName} ${(req as any).user?.lastName}`,
        action: 'EDITAR_USUARIO',
        entity: 'User',
        entityId: String(user.id),
        description: `Editó el usuario ${user.firstName} ${user.lastName}`,
        ipAddress: req.ip,
        oldValues: oldUser,
        newValues: user,
      });
      res.json(user);
    } catch (err) { next(err); }
  },

  changeStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const oldUser = await UserModel.getById(Number(req.params.id));
      if (!oldUser) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
      const user = await UserModel.updateUser(Number(req.params.id), { status });
      const statusLabels: Record<string, string> = { activo: 'Activó', inactivo: 'Desactivó', bloqueado: 'Bloqueó' };
      const actionLabel = statusLabels[status] || 'Cambió estado de';
      await AuditModel.log({
        userId: (req as any).user?.userId,
        userEmail: (req as any).user?.email,
        userName: `${(req as any).user?.firstName} ${(req as any).user?.lastName}`,
        action: `CAMBIAR_ESTADO_${status?.toUpperCase()}`,
        entity: 'User',
        entityId: String(user.id),
        description: `${actionLabel} el usuario ${user.firstName} ${user.lastName}`,
        ipAddress: req.ip,
        oldValues: { status: oldUser.status },
        newValues: { status },
      });
      res.json(user);
    } catch (err) { next(err); }
  },

  changeRole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body;
      const oldUser = await UserModel.getById(Number(req.params.id));
      if (!oldUser) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
      const user = await UserModel.updateUser(Number(req.params.id), { role });
      await AuditModel.log({
        userId: (req as any).user?.userId,
        userEmail: (req as any).user?.email,
        userName: `${(req as any).user?.firstName} ${(req as any).user?.lastName}`,
        action: 'CAMBIAR_ROL',
        entity: 'User',
        entityId: String(user.id),
        description: `Cambió el rol de ${user.firstName} ${user.lastName} de ${oldUser.role} a ${role}`,
        ipAddress: req.ip,
        oldValues: { role: oldUser.role },
        newValues: { role },
      });
      res.json(user);
    } catch (err) { next(err); }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newPassword } = req.body;
      const user = await UserModel.getById(Number(req.params.id));
      if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
      await UserModel.resetPassword(Number(req.params.id), newPassword);
      await AuditModel.log({
        userId: (req as any).user?.userId,
        userEmail: (req as any).user?.email,
        userName: `${(req as any).user?.firstName} ${(req as any).user?.lastName}`,
        action: 'RESTABLECER_PASSWORD',
        entity: 'User',
        entityId: String(user.id),
        description: `Restableció la contraseña de ${user.firstName} ${user.lastName}`,
        ipAddress: req.ip,
      });
      res.json({ message: 'Contraseña restablecida exitosamente' });
    } catch (err) { next(err); }
  },

  getActivity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await UserModel.getActivityHistory(Number(req.params.id));
      res.json({ logs });
    } catch (err) { next(err); }
  },

  getLoginHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attempts = await UserModel.getLoginHistory(Number(req.params.id));
      res.json({ attempts });
    } catch (err) { next(err); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const user = await UserModel.getById(id);
      if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }

      const deleted = await UserModel.deleteUser(id);

      await AuditModel.log({
        userId: (req as any).user?.userId,
        userEmail: (req as any).user?.email,
        userName: `${(req as any).user?.firstName} ${(req as any).user?.lastName}`,
        action: 'ELIMINAR_USUARIO',
        entity: 'User',
        entityId: String(id),
        description: `Eliminó al usuario ${user.firstName} ${user.lastName} (${user.email})`,
        ipAddress: req.ip,
      });

      res.json({ message: 'Usuario eliminado permanentemente' });
    } catch (err) { next(err); }
  },
};
