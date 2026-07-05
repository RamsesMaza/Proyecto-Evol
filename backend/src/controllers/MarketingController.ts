import { Request, Response, NextFunction } from 'express';
import { MarketingModel } from '../models/MarketingModel';

const getIp = (req: Request): string | undefined => req.ip || req.socket.remoteAddress;
const userId = (req: Request): number | undefined => (req as any).user?.userId;

export const MarketingController = {

  /* ───── DASHBOARD ───── */
  dashboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await MarketingModel.getDashboardStats();
      res.json(stats);
    } catch (err) { next(err); }
  },

  /* ───── LEADS ───── */
  listLeads: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await MarketingModel.listLeads(req.query as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  getLead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await MarketingModel.getLead(Number(req.params.id));
      res.json(lead);
    } catch (err) { next(err); }
  },

  createLead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await MarketingModel.createLead(req.body, userId(req), getIp(req));
      res.status(201).json(lead);
    } catch (err) { next(err); }
  },

  updateLead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await MarketingModel.updateLead(Number(req.params.id), req.body, userId(req), getIp(req));
      res.json(lead);
    } catch (err) { next(err); }
  },

  deleteLead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await MarketingModel.deleteLead(Number(req.params.id), userId(req), getIp(req));
      res.json({ message: 'Lead eliminado' });
    } catch (err) { next(err); }
  },

  addLeadActivity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await MarketingModel.addLeadActivity(Number(req.params.id), req.body, userId(req), getIp(req));
      res.status(201).json(activity);
    } catch (err) { next(err); }
  },

  /* ───── CAMPAIGNS ───── */
  listCampaigns: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await MarketingModel.listCampaigns(req.query as any);
      res.json(result);
    } catch (err) { next(err); }
  },

  getCampaign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await MarketingModel.getCampaign(Number(req.params.id));
      res.json(campaign);
    } catch (err) { next(err); }
  },

  createCampaign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await MarketingModel.createCampaign(req.body, userId(req), getIp(req));
      res.status(201).json(campaign);
    } catch (err) { next(err); }
  },

  updateCampaign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await MarketingModel.updateCampaign(Number(req.params.id), req.body, userId(req), getIp(req));
      res.json(campaign);
    } catch (err) { next(err); }
  },

  deleteCampaign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await MarketingModel.deleteCampaign(Number(req.params.id), userId(req), getIp(req));
      res.json({ message: 'Campaña eliminada' });
    } catch (err) { next(err); }
  },

  recordCampaignResult: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await MarketingModel.recordCampaignResult(Number(req.params.id), req.body, userId(req), getIp(req));
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  /* ───── SEGMENTS ───── */
  listSegments: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const segments = await MarketingModel.listSegments();
      res.json({ segments });
    } catch (err) { next(err); }
  },

  getSegment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const segment = await MarketingModel.getSegment(Number(req.params.id));
      res.json(segment);
    } catch (err) { next(err); }
  },

  createSegment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const segment = await MarketingModel.createSegment(req.body, userId(req), getIp(req));
      res.status(201).json(segment);
    } catch (err) { next(err); }
  },

  deleteSegment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await MarketingModel.deleteSegment(Number(req.params.id), userId(req), getIp(req));
      res.json({ message: 'Segmento eliminado' });
    } catch (err) { next(err); }
  },

  evaluateSegment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await MarketingModel.evaluateSegment(Number(req.params.id));
      res.json(result);
    } catch (err) { next(err); }
  },

  /* ───── EMAIL CAMPAIGNS ───── */
  listEmailCampaigns: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaigns = await MarketingModel.listEmailCampaigns(req.query.campaignId ? Number(req.query.campaignId) : undefined);
      res.json({ campaigns });
    } catch (err) { next(err); }
  },

  createEmailCampaign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await MarketingModel.createEmailCampaign(req.body, userId(req), getIp(req));
      res.status(201).json(campaign);
    } catch (err) { next(err); }
  },

  updateEmailCampaign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await MarketingModel.updateEmailCampaign(Number(req.params.id), req.body);
      res.json(campaign);
    } catch (err) { next(err); }
  },

  /* ───── SMS CAMPAIGNS ───── */
  listSmsCampaigns: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaigns = await MarketingModel.listSmsCampaigns(req.query.campaignId ? Number(req.query.campaignId) : undefined);
      res.json({ campaigns });
    } catch (err) { next(err); }
  },

  createSmsCampaign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await MarketingModel.createSmsCampaign(req.body, userId(req), getIp(req));
      res.status(201).json(campaign);
    } catch (err) { next(err); }
  },

  updateSmsCampaign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const campaign = await MarketingModel.updateSmsCampaign(Number(req.params.id), req.body);
      res.json(campaign);
    } catch (err) { next(err); }
  },

  /* ───── REPORTS ───── */
  reports: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await MarketingModel.getReports(req.query as any);
      res.json(report);
    } catch (err) { next(err); }
  },

  /* ───── SALES INTEGRATION ───── */
  leadSources: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const sources = await MarketingModel.listLeads({ page: 1, pageSize: 1000 });
      res.json({ leads: sources.leads.filter(l => l.campaignId) });
    } catch (err) { next(err); }
  },
};
