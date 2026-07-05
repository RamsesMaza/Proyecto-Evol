import { Request, Response, NextFunction } from 'express';
import { ReportsModel } from '../models/ReportsModel';

export const ReportsController = {

  general: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await ReportsModel.getGeneral(req.query as any)); }
    catch (err) { next(err); }
  },

  userGrowth: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await ReportsModel.getUserGrowth(req.query as any)); }
    catch (err) { next(err); }
  },

  leads: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await ReportsModel.getLeads(req.query as any)); }
    catch (err) { next(err); }
  },

  leadTrend: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await ReportsModel.getLeadTrend(req.query as any)); }
    catch (err) { next(err); }
  },

  campaigns: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await ReportsModel.getCampaigns(req.query as any)); }
    catch (err) { next(err); }
  },

  revenue: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await ReportsModel.getRevenue(req.query as any)); }
    catch (err) { next(err); }
  },

  activity: async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await ReportsModel.getActivity(req.query as any)); }
    catch (err) { next(err); }
  },

};
