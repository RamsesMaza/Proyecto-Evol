import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { ReportsController } from '../controllers/ReportsController';

const router = Router();

router.use(authenticate);

router.get('/general', requireRole('ADMIN', 'MARKETING', 'SALES'), ReportsController.general);
router.get('/user-growth', requireRole('ADMIN', 'TI'), ReportsController.userGrowth);
router.get('/leads', requireRole('ADMIN', 'MARKETING', 'SALES'), ReportsController.leads);
router.get('/lead-trend', requireRole('ADMIN', 'MARKETING', 'SALES'), ReportsController.leadTrend);
router.get('/campaigns', requireRole('ADMIN', 'MARKETING'), ReportsController.campaigns);
router.get('/revenue', requireRole('ADMIN', 'SALES', 'MARKETING'), ReportsController.revenue);
router.get('/activity', requireRole('ADMIN', 'TI'), ReportsController.activity);

export default router;
