import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { CourseController } from '../controllers/CourseController';

const router = Router();

router.use(authenticate);

/* Auditor: full CRUD */
router.get('/all', requireRole('ADMIN', 'AUDITOR'), CourseController.listAll);
router.post('/', requireRole('ADMIN', 'AUDITOR'), CourseController.create);
router.put('/:id', requireRole('ADMIN', 'AUDITOR'), CourseController.update);
router.patch('/:id/publish', requireRole('ADMIN', 'AUDITOR'), CourseController.togglePublish);
router.delete('/:id', requireRole('ADMIN', 'AUDITOR'), CourseController.delete);

/* Modules */
router.post('/:id/modules', requireRole('ADMIN', 'AUDITOR'), CourseController.addModule);
router.put('/modules/:moduleId', requireRole('ADMIN', 'AUDITOR'), CourseController.updateModule);
router.delete('/modules/:moduleId', requireRole('ADMIN', 'AUDITOR'), CourseController.deleteModule);

/* Materials */
router.post('/modules/:moduleId/materials', requireRole('ADMIN', 'AUDITOR'), CourseController.addMaterial);
router.put('/materials/:id', requireRole('ADMIN', 'AUDITOR'), CourseController.updateMaterial);
router.delete('/materials/:id', requireRole('ADMIN', 'AUDITOR'), CourseController.deleteMaterial);

/* Public: list published courses, get details, enroll */
router.get('/', CourseController.list);
router.get('/:id', CourseController.getById);
router.get('/:id/enrollments', requireRole('ADMIN', 'AUDITOR'), CourseController.enrollmentsByCourse);
router.post('/:id/enroll', CourseController.enroll);
router.get('/me/mine', CourseController.myCourses);
router.patch('/:id/progress', CourseController.updateProgress);

export default router;
