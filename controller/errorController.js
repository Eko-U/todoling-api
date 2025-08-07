const AppError = require('../utils/appError');

function handleCastError(err) {
  const msg = 'Invalid ID';
  return new AppError(msg, 400);
}

function handleValidationError(err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const msg = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(msg, 400);
}

function handleDuplicateData(err) {
  const msg = `Duplicate input data. ${err.errorResponse.errmsg?.match(
    /([""])(\\?.)*?\1/,
  )}`;
  return new AppError(msg, 400);
}

function handleTokenExpiredError(err) {
  return new AppError('Please login again. Thanks', 400);
}

function sendProdError(err, req, res) {
  // RENDERED WEBSITE

  // API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(err.statusCode).json({
        status: err.status,
        message: 'Please login again. Thanks',
      });
    }
  }
}

function sendDevError(err, req, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

module.exports = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development')
    return sendDevError(err, req, res);

  if (process.env.NODE_ENV === 'production') {
    let error = err;
    error.message = err.message;

    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'CastError') error = handleCastError(err);
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredError(err);
    if (err.code === 11000) error = handleDuplicateData(err);

    sendProdError(error, req, res);
  }
};
