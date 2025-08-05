module.exports = class AppError extends Error {
  constructor(message, statusCode, name) {
    super(message);

    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.statusCode = statusCode;
    this.name = name || '';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
};
