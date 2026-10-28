/**
 * Custom API error class — throw new ApiError(400, 'message')
 */
class ApiError extends Error {
    constructor(statusCode, message, details = null, code = null) {
      super(message);
      this.statusCode = statusCode;
      this.details = details;
      this.code = code;
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  /**
   * Wrap async controllers so rejected promises reach Express error handler.
   * Usage: router.get('/', asyncHandler(ctrl.getEmployees))
   */
  const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
  
  /**
   * 404 handler — must be registered AFTER all routes.
   */
  const notFound = (req, res, next) => {
    const err = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
    next(err);
  };
  
  /**
   * Global error handler — must be the LAST middleware.
   */
  const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || err.status || 500;
  
    // ---- Log full error in development ----
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Error:', {
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
      });
    } else if (error.statusCode >= 500) {
      // In prod, log only server errors
      console.error('❌ Server Error:', err.message, err.stack);
    }
  
    // ---- Mongoose: bad ObjectId ----
    if (err.name === 'CastError') {
      error.statusCode = 400;
      error.message = `Invalid ${err.path}: ${err.value}`;
      error.code = 'INVALID_ID';
    }
  
    // ---- Mongoose: validation failed ----
    if (err.name === 'ValidationError') {
      error.statusCode = 400;
      error.message = 'Validation failed';
      error.details = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      error.code = 'VALIDATION_ERROR';
    }
  
    // ---- Mongo: duplicate key ----
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      const value = err.keyValue ? err.keyValue[field] : '';
      error.statusCode = 409;
      error.message = `Duplicate value for '${field}': ${value}`;
      error.code = 'DUPLICATE_KEY';
    }
  
    // ---- JWT: expired ----
    if (err.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = 'Session expired — please log in again';
      error.code = 'TOKEN_EXPIRED';
    }
  
    // ---- JWT: invalid ----
    if (err.name === 'JsonWebTokenError') {
      error.statusCode = 401;
      error.message = 'Invalid authentication token';
      error.code = 'INVALID_TOKEN';
    }
  
    // ---- Multer: file too large ----
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = 413;
      error.message = 'File too large';
      error.code = 'FILE_TOO_LARGE';
    }
  
    // ---- Multer: unexpected field ----
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error.statusCode = 400;
      error.message = `Unexpected file field: ${err.field}`;
      error.code = 'UNEXPECTED_FILE';
    }
  
    // ---- Body parser: malformed JSON ----
    if (err.type === 'entity.parse.failed') {
      error.statusCode = 400;
      error.message = 'Malformed JSON in request body';
      error.code = 'INVALID_JSON';
    }
  
    // ---- Build response ----
    const payload = {
      success: false,
      message: error.message || 'Internal server error',
    };
  
    if (error.code) payload.code = error.code;
    if (error.details) payload.details = error.details;
    if (process.env.NODE_ENV !== 'production') payload.stack = err.stack;
  
    res.status(error.statusCode).json(payload);
  };
  
  module.exports = {
    ApiError,
    asyncHandler,
    notFound,
    errorHandler,
  };