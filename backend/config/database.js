import mongoose from 'mongoose'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 3000

/**
 * Connect to MongoDB with retry logic.
 * Exits the process if all retries fail — there's no point running
 * the API server without a database.
 */
export async function connectDB(retries = MAX_RETRIES) {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.error('[DB] MONGODB_URI is not set in environment variables.')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    const { host, name } = mongoose.connection

    console.log(`[DB] Connected → ${host}/${name}`)

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('[DB] Connection error:', err.message)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] Disconnected from MongoDB')
    })

  } catch (err) {
    console.error(`[DB] Connection failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, err.message)

    if (retries > 1) {
      console.log(`[DB] Retrying in ${RETRY_DELAY_MS / 1000}s…`)
      await new Promise(res => setTimeout(res, RETRY_DELAY_MS))
      return connectDB(retries - 1)
    }

    console.error('[DB] All retries exhausted. Exiting.')
    process.exit(1)
  }
}

/**
 * Gracefully close the DB connection.
 * Called during server shutdown.
 */
export async function disconnectDB() {
  try {
    await mongoose.connection.close()
    console.log('[DB] Connection closed gracefully.')
  } catch (err) {
    console.error('[DB] Error during disconnect:', err.message)
  }
}
