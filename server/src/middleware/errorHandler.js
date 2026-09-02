// Centralized error handler. Keeps controllers thin.
function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Express recognizes a 4-arg signature as an error handler.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || 500;
  const payload = {
    success: false,
    code: err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'BAD_REQUEST'),
    message: err.message || 'Internal server error',
  };
  if (err.details) payload.details = err.details;
  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    payload.stack = err.stack;
  }
  console.error(`[error] ${status} ${req.method} ${req.originalUrl}:`, err.message);
  res.status(status).json(payload);
}

class HttpError extends Error {
  constructor(statusCode, message, code, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    if (details) this.details = details;
  }
}

module.exports = { notFound, errorHandler, HttpError };
