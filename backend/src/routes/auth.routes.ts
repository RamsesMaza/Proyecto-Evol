import { Router } from 'express';
import passport from '../lib/passport';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Google OAuth (solo si configurado)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'], session: false,
    prompt: 'select_account', accessType: 'offline',
  }));
  router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login` }),
    (req, res) => {
      const data = req.user as { user: any; token: string };
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?token=${data.token}`);
    }
  );
}

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

router.get('/me', authenticate, AuthController.me);

export default router;
