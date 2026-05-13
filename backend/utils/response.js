/**
 * Consistent API response shapes.
 * All responses follow: { success, data?, error?, meta? }
 */

export const ok = (res, data, meta = {}) =>
  res.status(200).json({ success: true, data, ...meta })

export const created = (res, data) =>
  res.status(201).json({ success: true, data })

export const badRequest = (res, message, details = null) =>
  res.status(400).json({ success: false, error: { message, details } })

export const notFound = (res, message = 'Resource not found') =>
  res.status(404).json({ success: false, error: { message } })

export const conflict = (res, message) =>
  res.status(409).json({ success: false, error: { message } })

export const serverError = (res, err, context = '') => {
  const message = err?.message ?? 'Internal server error'
  console.error(`[Error]${context ? ' ' + context + ':' : ''}`, message)
  return res.status(500).json({ success: false, error: { message: 'Something went wrong. Please try again.' } })
}
