import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import passport from './lib/passport';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/products.routes';
import categoryRoutes from './routes/categories.routes';
import orderRoutes from './routes/orders.routes';
import paymentRoutes from './routes/payments.routes';
import userRoutes from './routes/users.routes';
import cotizacionRoutes from './routes/cotizaciones.routes';
import adminTiRoutes from './routes/admin-ti.routes';
import notificationRoutes from './routes/notifications.routes';
import settingsRoutes from './routes/settings.routes';
import marketingRoutes from './routes/marketing.routes';
import reportsRoutes from './routes/reports.routes';
import certificatesRoutes from './routes/certificates.routes';
import coursesRoutes from './routes/courses.routes';
import messagesRoutes from './routes/messages.routes';
import usersRoutes from './routes/users.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
});
app.use('/api/', limiter);

// Stricter rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos de autenticación' },
});
app.use('/api/auth/', authLimiter);

app.use(passport.initialize());

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);
app.use('/api/admin-ti', adminTiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Serve frontend
const frontendDist = path.join(__dirname, '../../front/dist');
app.use(express.static(frontendDist));
app.use((_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
