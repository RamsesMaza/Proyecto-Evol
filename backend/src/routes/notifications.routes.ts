import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();

router.get('/unread-count', authenticate, NotificationController.unreadCount);
router.get('/mine', authenticate, NotificationController.getMyNotifications);
router.post('/mark-all-read', authenticate, NotificationController.markAllRead);
router.get('/', authenticate, NotificationController.list);
router.post('/', authenticate, NotificationController.create);
router.patch('/:id/read', authenticate, NotificationController.markRead);
router.delete('/:id', authenticate, NotificationController.delete);

export default router;
