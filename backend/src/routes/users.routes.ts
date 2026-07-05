import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { UserSearchController } from '../controllers/UserSearchController';

const router = Router();

router.use(authenticate);

router.get('/search', UserSearchController.search);

export default router;
