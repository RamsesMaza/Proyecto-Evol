import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { TiUserController } from '../controllers/TiUserController';
import { TiDashboardController } from '../controllers/TiDashboardController';
import { AuditController } from '../controllers/AuditController';
import { SupportTicketController } from '../controllers/SupportTicketController';
import { LoginAttemptController } from '../controllers/LoginAttemptController';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'TI'));

/* Dashboard */
router.get('/dashboard/stats', TiDashboardController.stats);
router.get('/finanzas', TiDashboardController.finanzas);
router.get('/sessions', TiDashboardController.sessions);
router.delete('/sessions/:id', TiDashboardController.closeSession);

/* Users - Full CRUD */
router.get('/users', TiUserController.list);
router.get('/users/:id', TiUserController.getById);
router.post('/users', TiUserController.create);
router.put('/users/:id', TiUserController.update);
router.patch('/users/:id/status', TiUserController.changeStatus);
router.patch('/users/:id/role', TiUserController.changeRole);
router.post('/users/:id/reset-password', TiUserController.resetPassword);
router.get('/users/:id/activity', TiUserController.getActivity);
router.get('/users/:id/login-history', TiUserController.getLoginHistory);
router.delete('/users/:id', TiUserController.delete);

/* Permissions */
router.get('/permissions', TiDashboardController.permissions.list);
router.get('/permissions/role/:role', TiDashboardController.permissions.getRolePermissions);
router.post('/permissions', TiDashboardController.permissions.create);
router.post('/permissions/assign', TiDashboardController.permissions.assign);
router.post('/permissions/remove', TiDashboardController.permissions.remove);

/* Audit */
router.get('/audit', AuditController.list);
router.get('/audit/recent', AuditController.recent);

/* Support Tickets */
router.get('/support-tickets', SupportTicketController.list);
router.get('/support-tickets/stats', SupportTicketController.stats);
router.get('/support-tickets/:id', SupportTicketController.getById);
router.post('/support-tickets', SupportTicketController.create);
router.patch('/support-tickets/:id', SupportTicketController.update);

/* Login Attempts */
router.get('/login-attempts', LoginAttemptController.list);
router.get('/login-attempts/stats', LoginAttemptController.stats);

export default router;
