import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';

const router = Router();

router.get('/', ProductController.validate.list, ProductController.list);
router.get('/:id', ProductController.getById);
router.post('/:id/reviews', ProductController.validate.createReview, ProductController.createReview);

export default router;
