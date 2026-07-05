import { logger } from './logger';

let initialized = false;

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    logger.warn('SENTRY_DSN no configurado. Saltando inicialización de Sentry.');
    return;
  }
  try {
    // Dynamic import to avoid crash if package missing
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node');
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.2'),
    });
    initialized = true;
    logger.info('Sentry inicializado');
  } catch (err) {
    logger.error({ err }, 'Error al inicializar Sentry');
  }
}

export function isSentryEnabled(): boolean {
  return initialized;
}
