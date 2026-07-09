import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { UserSearchController } from '../controllers/UserSearchController';
import { UserController } from '../controllers/UserController';
import { requireRole } from '../middleware/roleGuard';

const router = Router();

router.use(authenticate);

router.get('/search', UserSearchController.search);

// Clientes routes (SALES, ADMIN, MARKETING, AUDITOR)
router.get('/clientes/stats', requireRole('ADMIN', 'SALES', 'MARKETING', 'AUDITOR'), UserController.stats);
router.get('/clientes', UserController.validate.list, UserController.listClientes);
router.get('/clientes/:id', UserController.getById);
router.post('/clientes', UserController.create);
router.put('/clientes/:id', UserController.validate.update, UserController.update);
router.delete('/clientes/:id', UserController.remove);

export default router;
