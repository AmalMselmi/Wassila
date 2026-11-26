import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.path}`));
}

function normalizeError(err) {
  if (err instanceof AppError) return err;

  // Errors thrown by body-parser (Express JSON parsing)
  if (err?.type === 'entity.parse.failed') {
    return new AppError(400, 'INVALID_JSON', 'Request body is not valid JSON');
  }
  if (err?.type === 'entity.too.large') {
    return new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
  }

  // Mongoose errors
  if (err?.name === 'CastError') {
    return new AppError(400, 'INVALID_ID', 'Invalid identifier');
  }
  if (err?.name === 'ValidationError') {
    return new AppError(400, 'VALIDATION_ERROR', 'Invalid data');
  }

  return null; // unexpected error
}

// Express recognises error handlers by their 4 parameters: keep `next`.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const known = normalizeError(err);
  const isUnexpected = known === null;
  const statusCode = isUnexpected ? 500 : known.statusCode;

  if (statusCode >= 500) {
    req.log?.error({ err }, 'Unhandled error') ?? logger.error({ err }, 'Unhandled error');
  } else {
    req.log?.warn({ code: known.code, status: statusCode }, known.message);
  }

  const body = {
    success: false,
    error: {
      code: isUnexpected ? 'INTERNAL_ERROR' : known.code,
      // Never leak internal error messages to clients.
      message: isUnexpected ? 'Something went wrong' : known.message,
    },
  };
  if (!isUnexpected && known.details !== undefined) body.error.details = known.details;
  if (env.NODE_ENV === 'development' && err?.stack) body.error.stack = err.stack;

  return res.status(statusCode).json(body);
}