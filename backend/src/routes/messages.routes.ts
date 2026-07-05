import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { MessageController } from '../controllers/MessageController';

const router = Router();

router.use(authenticate);

router.get('/conversations', MessageController.conversations);
router.get('/thread/:userId', MessageController.thread);
router.post('/send', MessageController.send);
router.get('/unread', MessageController.unread);
router.get('/auditors', MessageController.auditors);
router.get('/contacts', MessageController.contacts);

export default router;
