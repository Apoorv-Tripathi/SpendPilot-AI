import { nanoid } from 'nanoid'
import Audit from '../models/Audit.js'

const ID_LENGTH = 8 // e.g. "xK3mN9pQ" — short but collision-resistant enough

/**
 * Generate a unique public audit ID.
 * Checks the DB to guarantee no collision (extremely rare but safe).
 *
 * @returns {Promise<string>}
 */
export async function generatePublicId() {
  const MAX_ATTEMPTS = 5

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const id = nanoid(ID_LENGTH)
    const existing = await Audit.findOne({ publicId: id })
    if (!existing) return id
  }

  // Fallback: longer ID is statistically unique
  return nanoid(ID_LENGTH + 4)
}
