import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

/**
 * GET /api/health
 * Used by deployment platforms (Railway, Render, etc.) to verify the service is up.
 */
router.get('/', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting']
  const dbStatus = dbState[mongoose.connection.readyState] ?? 'unknown'

  res.status(200).json({
    success:  true,
    status:   'ok',
    version:  '1.0.0',
    env:      process.env.NODE_ENV ?? 'development',
    database: dbStatus,
    uptime:   `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  })
})

export default router
