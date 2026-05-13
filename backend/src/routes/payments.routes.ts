import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';

const router = Router();

router.post('/create-preference', PaymentController.validate.createPreference, PaymentController.createPreference);
router.post('/webhook', PaymentController.webhook);
router.post('/check-status', PaymentController.validate.checkStatus, PaymentController.checkStatus);

export default router;
