import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { MarketingController } from '../controllers/MarketingController';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'MARKETING'));

/* Dashboard */
router.get('/dashboard', MarketingController.dashboard);

/* Leads */
router.get('/leads', MarketingController.listLeads);
router.get('/leads/:id', MarketingController.getLead);
router.post('/leads', MarketingController.createLead);
router.put('/leads/:id', MarketingController.updateLead);
router.delete('/leads/:id', MarketingController.deleteLead);
router.post('/leads/:id/activity', MarketingController.addLeadActivity);

/* Campaigns */
router.get('/campaigns', MarketingController.listCampaigns);
router.get('/campaigns/:id', MarketingController.getCampaign);
router.post('/campaigns', MarketingController.createCampaign);
router.put('/campaigns/:id', MarketingController.updateCampaign);
router.delete('/campaigns/:id', MarketingController.deleteCampaign);
router.post('/campaigns/:id/results', MarketingController.recordCampaignResult);

/* Email Campaigns */
router.get('/email-campaigns', MarketingController.listEmailCampaigns);
router.post('/email-campaigns', MarketingController.createEmailCampaign);
router.put('/email-campaigns/:id', MarketingController.updateEmailCampaign);

/* SMS Campaigns */
router.get('/sms-campaigns', MarketingController.listSmsCampaigns);
router.post('/sms-campaigns', MarketingController.createSmsCampaign);
router.put('/sms-campaigns/:id', MarketingController.updateSmsCampaign);

/* Segments */
router.get('/segments', MarketingController.listSegments);
router.get('/segments/:id', MarketingController.getSegment);
router.post('/segments', MarketingController.createSegment);
router.delete('/segments/:id', MarketingController.deleteSegment);
router.post('/segments/:id/evaluate', MarketingController.evaluateSegment);

/* Reports */
router.get('/reports', MarketingController.reports);

/* Integration */
router.get('/lead-sources', MarketingController.leadSources);

export default router;
