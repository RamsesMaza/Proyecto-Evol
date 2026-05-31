import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/clientes', UserController.validate.list, UserController.listClientes);
router.get('/clientes/stats', UserController.stats);
router.put('/clientes/:id', authenticate, UserController.validate.update, UserController.update);
router.put('/profile', authenticate, UserController.validate.updateProfile, UserController.updateProfile);

export default router;
