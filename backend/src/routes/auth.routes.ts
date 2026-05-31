import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.validate.register, AuthController.register);
router.post('/login', AuthController.validate.login, AuthController.login);
router.post('/forgot-password', AuthController.validate.forgotPassword, AuthController.forgotPassword);
router.post('/verify-otp', AuthController.validate.verifyOtp, AuthController.verifyOtp);
router.post('/reset-password', AuthController.validate.resetPassword, AuthController.resetPassword);

router.post('/verify-2fa', AuthController.validate.verify2fa, AuthController.verify2fa);
router.post('/2fa/send-otp', AuthController.validate.send2faOtp, AuthController.send2faOtp);

router.get('/2fa/status', authenticate, AuthController.get2faStatus);
router.post('/2fa/setup', authenticate, AuthController.validate.setup2fa, AuthController.setup2fa);
router.post('/2fa/confirm', authenticate, AuthController.validate.confirm2fa, AuthController.confirm2fa);
router.post('/2fa/disable', authenticate, AuthController.validate.disable2fa, AuthController.disable2fa);

export default router;
