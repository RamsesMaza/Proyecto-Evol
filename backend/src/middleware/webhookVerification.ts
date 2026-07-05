import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../lib/logger';

// Simple in-memory idempotency store (resets on restart)
const processedEvents = new Set<string>();

export function verifyMercadoPagoWebhook(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-signature'] as string;
  const requestId = req.headers['x-request-id'] as string;
  const clientSecret = process.env.MP_CLIENT_SECRET;

  // In dev, skip verification
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // If client secret isn't set, skip but warn
  if (!clientSecret) {
    logger.warn('MP_CLIENT_SECRET no configurado. Saltando verificación de webhook.');
    return next();
  }

  if (!signature || !requestId) {
    logger.warn('Webhook sin firma o request-id. Rechazando.');
    return res.status(401).json({ error: 'Firma inválida' });
  }

  // Mercado Pago sends: ts=<timestamp>,v1=<hash>
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const ts = parts['ts'];
  const hash = parts['v1'];

  if (!ts || !hash) {
    return res.status(401).json({ error: 'Firma inválida' });
  }

  const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac('sha256', clientSecret)
    .update(manifest)
    .digest('hex');

  if (hash !== expectedHash) {
    logger.warn({ expectedHash, receivedHash: hash }, 'Firma de webhook no coincide');
    return res.status(401).json({ error: 'Firma inválida' });
  }

  // Idempotency check
  const eventId = `${requestId}:${ts}`;
  if (processedEvents.has(eventId)) {
    logger.info({ eventId }, 'Webhook duplicado ignorado');
    return res.status(200).json({ message: 'OK' });
  }
  processedEvents.add(eventId);

  // Clean old entries after 1 hour
  setTimeout(() => processedEvents.delete(eventId), 60 * 60 * 1000);

  next();
}
