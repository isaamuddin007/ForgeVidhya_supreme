/**
 * backend/middleware/errorMiddleware.js
 * 404 handler + centralized error handler with environment-aware output.
 *
 * Security note: Suppresses stack traces and internal details in production so
 * error responses never leak paths, queries, or dependency versions to clients.
 *
 * Env variables:
 *   NODE_ENV - 'production' hides stack traces and generic-izes 5xx messages
 */

const logger = require('../utils/logger');

const isProd = process.env.NODE_ENV === 'production';

/**
 * notFound: for any unmatched route. Feeds into the error handler below.
 */
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

/**
 * errorHandler: single place that formats every error response.
 */
// eslint-disable-next-line no-unused-vars -- Express requires the 4-arg signature
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode >= 400 ? res.statusCode : 500;
  if (!err.statusCode && statusCode < 400) statusCode = 500;
  statusCode = err.statusCode || statusCode;

  let message = err.message || 'Internal Server Error';

  // Normalize common Mongoose / JWT errors into safe, predictable responses.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation error';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate value violates a unique constraint';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication failed';
  }

  // Log server-side with full detail (stack included) regardless of env.
  const logMeta = {
    statusCode,
    method: req.method,
    route: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id,
  };
  if (statusCode >= 500) {
    logger.error(err.message, { ...logMeta, stack: err.stack });
  } else {
    logger.warn(err.message, logMeta);
  }

  // In production, never expose internals for 5xx errors.
  if (isProd && statusCode >= 500) {
    message = 'Something went wrong. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Stack only in non-production, for local debugging.
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
