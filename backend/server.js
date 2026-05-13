import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { connectDB, disconnectDB } from './config/database.js'
import { apiLimiter } from './middleware/rateLimiter.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

import healthRoutes from './routes/healthRoutes.js'
import auditRoutes  from './routes/auditRoutes.js'
import leadRoutes   from './routes/leadRoutes.js'
import ogRoutes     from './routes/ogRoutes.js'

const app  = express()
const PORT = process.env.PORT ?? 8080

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // React handles its own CSP needs
}))

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: Origin ${origin} not allowed`))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}))

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ─── Trust proxy (for rate limiting behind Render/Railway/Vercel) ─────────────
app.set('trust proxy', 1)

// ─── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter)

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRoutes)
app.use('/api/audits', auditRoutes)
app.use('/api/leads',  leadRoutes)
app.use('/og',         ogRoutes)    // OG meta pages for social sharing

app.get('/', (req, res) => {
  res.json({ name: 'SpendLens API', version: '1.0.0', health: '/api/health' })
})

// ─── Error handlers ───────────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 SpendLens API running on port ${PORT}`)
    console.log(`   Env  : ${process.env.NODE_ENV ?? 'development'}`)
    console.log(`   Health: http://localhost:${PORT}/api/health\n`)
  })

  const shutdown = async (signal) => {
    console.log(`\n[Server] ${signal} — shutting down…`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
  process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled rejection:', reason)
    process.exit(1)
  })
}

start()
