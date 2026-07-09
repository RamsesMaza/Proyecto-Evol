import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { ProductController } from '../controllers/ProductController';

const router = Router();

router.get('/', ProductController.validate.list, ProductController.list);
router.get('/:id', ProductController.getById);
router.post('/:id/reviews', ProductController.validate.createReview, ProductController.createReview);

/* Admin & Sales CRUD */
router.post('/', authenticate, requireRole('ADMIN', 'SALES'), ProductController.validate.create, ProductController.create);
router.put('/:id', authenticate, requireRole('ADMIN', 'SALES'), ProductController.validate.update, ProductController.update);
router.delete('/:id', authenticate, requireRole('ADMIN', 'SALES'), ProductController.delete);

export default router;
