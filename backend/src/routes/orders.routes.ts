import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { OrderController } from '../controllers/OrderController';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', authenticate, OrderController.validate.list, OrderController.list);
router.get('/stats', authenticate, OrderController.stats);
router.post('/', OrderController.validate.create, OrderController.create);
router.get('/:id', OrderController.getById);
router.get('/:id/invoice', OrderController.getInvoice);
router.post('/:id/send-invoice', validate(z.object({ email: z.string().email() })), OrderController.sendInvoice);

export default router;
