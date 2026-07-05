import { Request, Response, NextFunction } from 'express';
import { MessageModel } from '../models/MessageModel';
import { UserSearchModel } from '../models/UserSearchModel';

const uid = (req: Request): number | undefined => (req as any).user?.userId;

export const MessageController = {

  send: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const msg = await MessageModel.send({ ...req.body, senderId: uid(req)! });
      res.status(201).json(msg);
    } catch (err) { next(err); }
  },

  conversations: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await MessageModel.getConversations(uid(req)!)); }
    catch (err) { next(err); }
  },

  thread: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const msgs = await MessageModel.getThread(uid(req)!, Number(req.params.userId));
      await MessageModel.markRead(uid(req)!, Number(req.params.userId));
      res.json(msgs);
    } catch (err) { next(err); }
  },

  unread: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ count: await MessageModel.getUnreadCount(uid(req)!) }); }
    catch (err) { next(err); }
  },

  auditors: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json({ users: await MessageModel.listAuditors() }); }
    catch (err) { next(err); }
  },

  contacts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = (req.query.q as string) || '';
      const [auditors, searched] = await Promise.all([
        MessageModel.listAuditors(),
        q.length >= 2 ? UserSearchModel.search(q) : Promise.resolve([]),
      ]);
      const all = [...auditors];
      for (const s of searched) {
        if (!all.find(a => a.id === s.id)) all.push(s);
      }
      res.json({ users: all });
    } catch (err) { next(err); }
  },
};
