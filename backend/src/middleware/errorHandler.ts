import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    logger.warn({ statusCode: err.statusCode, code: err.code, message: err.message });
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ issues: err.issues }, 'Validation error');
    res.status(400).json({
      error: 'Datos inválidos',
      code: 'VALIDATION_ERROR',
      details: (err.issues as Array<{ path: (string | number)[]; message: string }>).map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Send unhandled errors to Sentry
  try {
    const Sentry = require('@sentry/node');
    Sentry.captureException(err);
  } catch {
    // Sentry not available
  }

  logger.error({ err, stack: err.stack }, 'Unhandled error');
  res.status(500).json({
    error: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
  });
};
