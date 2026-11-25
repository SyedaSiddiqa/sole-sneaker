export const notFound = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  err.status = 404
  next(err)
}

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500
  let message = err.message || 'Server error'

  if (err.name === 'CastError') {
    status = 404
    message = 'Resource not found'
  } else if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map((e) => e.message).join(', ')
  } else if (err.code === 11000) {
    status = 409
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  }

  if (status === 500) console.error(err)
  res.status(status).json({
    message: status === 500 && process.env.NODE_ENV === 'production' ? 'Server error' : message,
    ...(process.env.NODE_ENV !== 'production' && status === 500 ? { stack: err.stack } : {}),
  })
}
