export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
  }
}

export function notFound(req, res, next) {
  next(new AppError(`Not found - ${req.originalUrl}`, 404))
}

export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Server Error'

  if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid ${err.path}: ${err.value}`
  }
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
  }
  if (err.code === 11000) {
    statusCode = 409
    message = 'A record with this value already exists'
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}