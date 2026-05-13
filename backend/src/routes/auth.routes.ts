import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

router.post('/register', AuthController.validate.register, AuthController.register);
router.post('/login', AuthController.validate.login, AuthController.login);
router.post('/forgot-password', AuthController.validate.forgotPassword, AuthController.forgotPassword);
router.post('/verify-otp', AuthController.validate.verifyOtp, AuthController.verifyOtp);
router.post('/reset-password', AuthController.validate.resetPassword, AuthController.resetPassword);

export default router;
