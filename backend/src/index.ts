import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import passport from './lib/passport';
import { initSentry } from './lib/sentry';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './lib/prisma';

initSentry();

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

const app = express();
export default app;
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Request ID middleware
app.use((_req, res, next) => {
  const requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId);
  next();
});

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google.com", "https://www.gstatic.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.mercadopago.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://*.mercadopago.com", "https://www.google.com"],
      frameSrc: ["'self'", "https://www.google.com", "https://meet.jit.si"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos de autenticación' },
});
app.use('/api/auth/', authLimiter);

app.use(cookieParser());
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

// Health check with DB verification
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', uptime: process.uptime() });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// Serve frontend
const frontendDist = path.join(__dirname, '../../front/dist');
app.use(express.static(frontendDist));
app.use((_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Global error handler (must be last)
app.use(errorHandler);

// Only start listening when run directly (not imported for testing)
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, 'Servidor iniciado');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Recibida señal de cierre. Cerrando servidor...');
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Servidor cerrado correctamente');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
