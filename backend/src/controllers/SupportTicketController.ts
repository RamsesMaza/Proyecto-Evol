import { Request, Response, NextFunction } from 'express';
import { SupportTicketModel } from '../models/SupportTicketModel';
import { AuditModel } from '../models/AuditModel';

export const SupportTicketController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, ...rest } = req.query;
      const result = await SupportTicketModel.list({
        ...rest,
        page: Number(page) || 0,
        pageSize: Number(pageSize) || 50,
      } as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await SupportTicketModel.getById(Number(req.params.id));
      if (!ticket) { res.status(404).json({ error: 'Ticket no encontrado' }); return; }
      res.json(ticket);
    } catch (err) { next(err); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await SupportTicketModel.create({
        ...req.body,
        createdById: (req as any).user?.userId,
      });
      await AuditModel.log({
        userId: (req as any).user?.userId,
        userEmail: (req as any).user?.email,
        userName: `${(req as any).user?.firstName} ${(req as any).user?.lastName}`,
        action: 'CREAR_TICKET',
        entity: 'SupportTicket',
        entityId: String(ticket.id),
        description: `Creó el ticket: ${ticket.title}`,
        ipAddress: req.ip,
      });
      res.status(201).json(ticket);
    } catch (err) { next(err); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await SupportTicketModel.update(Number(req.params.id), req.body);
      await AuditModel.log({
        userId: (req as any).user?.userId,
        userEmail: (req as any).user?.email,
        userName: `${(req as any).user?.firstName} ${(req as any).user?.lastName}`,
        action: 'ACTUALIZAR_TICKET',
        entity: 'SupportTicket',
        entityId: String(ticket.id),
        description: `Actualizó el ticket #${ticket.id}: ${ticket.title}`,
        ipAddress: req.ip,
        newValues: req.body,
      });
      res.json(ticket);
    } catch (err) { next(err); }
  },

  stats: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await SupportTicketModel.getStats();
      res.json(stats);
    } catch (err) { next(err); }
  },
};
