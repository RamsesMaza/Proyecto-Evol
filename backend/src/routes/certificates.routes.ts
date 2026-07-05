import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { CertificateController } from '../controllers/CertificateController';

const router = Router();

/* Public — verify certificate by credentialId (no auth) */
router.get('/verify/:credentialId', CertificateController.verify);

router.use(authenticate);

/* Marketing / Admin routes */
router.get('/', requireRole('ADMIN', 'MARKETING'), CertificateController.list);
router.post('/', requireRole('ADMIN', 'MARKETING'), CertificateController.create);
router.get('/users', requireRole('ADMIN', 'MARKETING'), CertificateController.listUsers);
router.get('/:id', requireRole('ADMIN', 'MARKETING'), CertificateController.getById);
router.delete('/:id', requireRole('ADMIN', 'MARKETING'), CertificateController.delete);

/* User route — get own certificates */
router.get('/me/own', CertificateController.myCerts);

export default router;
