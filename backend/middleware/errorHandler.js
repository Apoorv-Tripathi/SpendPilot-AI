/**
 * Global Express error handler.
 * Catches any error passed via next(err) from routes or controllers.
 */
export function errorHandler(err, req, res, next) {
  // Log the full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Unhandled Error]', err)
  } else {
    console.error('[Unhandled Error]', err.message)
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid ID format' },
    })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field'
    return res.status(409).json({
      success: false,
      error: { message: `Duplicate value for ${field}` },
    })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', details },
    })
  }

  // JSON parse error (malformed request body)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid JSON in request body' },
    })
  }

  // Default 500
  const status = err.status ?? err.statusCode ?? 500
  return res.status(status).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again.'
        : (err.message ?? 'Internal server error'),
    },
  })
}

/**
 * 404 handler — mount AFTER all routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: { message: `Cannot ${req.method} ${req.path}` },
  })
}
