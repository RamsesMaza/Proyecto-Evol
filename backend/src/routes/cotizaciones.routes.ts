import { Router } from 'express';
import { CotizacionController } from '../controllers/CotizacionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/stats', CotizacionController.stats);
router.get('/', CotizacionController.validate.list, CotizacionController.list);
router.get('/:id', CotizacionController.getById);
router.post('/', authenticate, CotizacionController.validate.create, CotizacionController.create);
router.put('/:id', authenticate, CotizacionController.validate.update, CotizacionController.update);
router.patch('/:id/status', authenticate, CotizacionController.updateStatus);
router.delete('/:id', authenticate, CotizacionController.delete);

export default router;
