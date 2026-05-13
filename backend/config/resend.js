import { Resend } from 'resend'

let client = null

/**
 * Lazily initialise the Resend client.
 * Returns null if the API key is not configured.
 */
export function getResendClient() {
  if (client) return client

  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    console.warn('[Resend] API key not configured. Emails will be skipped.')
    return null
  }

  client = new Resend(apiKey)
  console.log('[Resend] Client initialised.')
  return client
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SpendLens <hello@spendlens.app>'
