import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  console.error(`${req.method} ${req.originalUrl} → ${statusCode}: ${message}`);

  const body = { success: false, message };
  if (err.details) {
    body.errors = err.details;
  }
  if (!env.isProduction && err.stack) {
    body.stack = err.stack.split('\n').slice(0, 4);
  }

  res.status(statusCode).json(body);
}