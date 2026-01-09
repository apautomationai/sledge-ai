import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

import { logger } from '@/helpers/logger';
import { config } from '@/lib/config';

import { BaseError } from './errors';

export async function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction // Prefix with _ to indicate it's intentionally unused
) {
  // Determine if this is a server error (5xx) that should be reported to Sentry
  const isServerError = !(err instanceof BaseError) || err.statusCode >= 500;

  // Only capture server errors (5xx) in Sentry, not client errors (4xx)
  if (isServerError) {
    Sentry.captureException(err, {
      contexts: {
        request: {
          url: req.originalUrl,
          method: req.method,
          headers: req.headers,
        },
      },
    });

    // Flush Sentry events (wait max 2 seconds)
    await Sentry.flush(2000);
  }

  // Log the error for debugging
  const errorLog = {
    message: err.message,
    name: err.name,
    stack: config.env === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };

  logger.error(`[${err.name}]: ${err.message}`);
  logger.error(errorLog);

  // Handle known errors
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.name,
        message: err.message,
        ...(err.details && { details: err.details })
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle unknown errors
  const errorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        name: err.name
      })
    },
    timestamp: new Date().toISOString()
  };

  return res.status(500).json(errorResponse);
}
