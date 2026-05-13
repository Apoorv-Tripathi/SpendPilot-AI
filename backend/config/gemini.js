import { GoogleGenerativeAI } from '@google/generative-ai'

let client = null

/**
 * Lazily initialise the Gemini client.
 * Returns null if the API key is not configured (allows graceful fallback).
 */
export function getGeminiClient() {
  if (client) return client

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('[Gemini] API key not configured. AI summaries will use fallback text.')
    return null
  }

  client = new GoogleGenerativeAI(apiKey)
  console.log('[Gemini] Client initialised.')
  return client
}

export const GEMINI_MODEL = 'gemini-1.5-flash'
export const GEMINI_TIMEOUT_MS = 10_000
