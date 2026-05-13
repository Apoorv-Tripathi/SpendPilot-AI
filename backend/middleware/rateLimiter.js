import rateLimit from 'express-rate-limit'

const MAX     = parseInt(process.env.RATE_LIMIT_MAX ?? '100')
const WINDOW  = 15 * 60 * 1000 // 15 minutes

/**
 * General API rate limiter — 100 requests per 15 min per IP.
 */
export const apiLimiter = rateLimit({
  windowMs:          WINDOW,
  max:               MAX,
  standardHeaders:   true,
  legacyHeaders:     false,
  message: {
    success: false,
    error: { message: 'Too many requests. Please wait a moment and try again.' },
  },
})

/**
 * Stricter limiter for write operations (audit + lead creation).
 * 20 requests per 15 min per IP.
 */
export const writeLimiter = rateLimit({
  windowMs:          WINDOW,
  max:               20,
  standardHeaders:   true,
  legacyHeaders:     false,
  message: {
    success: false,
    error: { message: 'Too many submissions. Please wait a few minutes.' },
  },
})
