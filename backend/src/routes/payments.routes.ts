import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { verifyMercadoPagoWebhook } from '../middleware/webhookVerification';

const router = Router();

router.post('/create-preference', PaymentController.validate.createPreference, PaymentController.createPreference);
router.post('/webhook', verifyMercadoPagoWebhook, PaymentController.webhook);
router.post('/check-status', PaymentController.validate.checkStatus, PaymentController.checkStatus);

export default router;
