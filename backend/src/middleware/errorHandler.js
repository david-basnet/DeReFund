// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle database errors
const handleDatabaseError = (err) => {
  if (err.code === '23505') { // Unique violation
    return new AppError('Duplicate entry. This record already exists.', 409);
  }
  if (err.code === '23503') { // Foreign key violation
    return new AppError('Referenced record does not exist.', 404);
  }
  if (err.code === '23502') { // Not null violation
    return new AppError('Required field is missing.', 400);
  }
  return new AppError('Database error occurred.', 500);
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Handle operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // Handle database errors
  if (err.code && err.code.startsWith('23')) {
    const dbError = handleDatabaseError(err);
    return res.status(dbError.statusCode).json({
      success: false,
      message: dbError.message
    });
  }

  // Unknown errors
  console.error('ERROR:', err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
};

module.exports = {
  AppError,
  globalErrorHandler,
  handleDatabaseError
};

