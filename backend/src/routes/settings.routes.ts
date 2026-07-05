import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { SystemSettingController } from '../controllers/SystemSettingController';

const router = Router();

router.get('/', authenticate, SystemSettingController.getAll);
router.get('/:key', authenticate, SystemSettingController.get);
router.put('/', authenticate, requireRole('ADMIN'), SystemSettingController.setMany);

export default router;
