/**
 * auditController.js
 * Handles: POST /api/audits       — save a new audit
 *          GET  /api/audits/:id   — fetch audit by public ID
 */

import Audit from '../models/Audit.js'
import { generatePublicId } from '../utils/generatePublicId.js'
import { generateAuditSummary } from '../services/geminiService.js'
import * as res from '../utils/response.js'

// ─── POST /api/audits ─────────────────────────────────────────────────────────

/**
 * Save a new audit report to the database.
 * Generates a public ID and AI summary before saving.
 *
 * Body: { context, tools, findings, metrics, verdict }
 */
export async function createAudit(req, resp) {
  try {
    const { context, tools, findings, metrics, verdict } = req.body

    // Basic shape validation (deep validation done by middleware)
    if (!context || !tools || !metrics || !verdict) {
      return res.badRequest(resp, 'Missing required audit fields: context, tools, metrics, verdict')
    }

    if (!Array.isArray(tools) || tools.length === 0) {
      return res.badRequest(resp, 'Audit must include at least one tool entry')
    }

    // Generate unique short public ID
    const publicId = await generatePublicId()

    // Generate AI summary (never throws — always returns a string)
    const auditDataForAI = { context, tools, findings: findings ?? [], metrics, verdict }
    const summaryResult  = await generateAuditSummary(auditDataForAI)

    // Build and save the audit document
    const audit = new Audit({
      publicId,
      context,
      tools,
      findings:  findings ?? [],
      metrics,
      verdict,
      aiSummary: {
        text:        summaryResult.text,
        generatedAt: new Date(),
        model:       summaryResult.model,
        isFallback:  summaryResult.isFallback,
      },
    })

    await audit.save()

    console.log(`[Audit] Created → publicId: ${publicId}, savings: $${metrics.potentialMonthlySavings}/mo`)

    return res.created(resp, audit.toPublic())

  } catch (err) {
    // Handle Mongoose validation errors separately for clearer messages
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors).map(e => e.message)
      return res.badRequest(resp, 'Audit validation failed', details)
    }
    return res.serverError(resp, err, 'createAudit')
  }
}

// ─── GET /api/audits/:publicId ────────────────────────────────────────────────

/**
 * Fetch an audit by its public short ID.
 * Increments the view counter on each fetch.
 */
export async function getAuditByPublicId(req, resp) {
  try {
    const { publicId } = req.params

    if (!publicId || publicId.length < 4) {
      return res.badRequest(resp, 'Invalid audit ID')
    }

    const audit = await Audit.findByPublicId(publicId)

    if (!audit) {
      return res.notFound(resp, `No audit found with ID: ${publicId}`)
    }

    // Async view count increment — don't await, don't block response
    audit.incrementViews().catch(e => console.warn('[Audit] Failed to increment views:', e.message))

    return res.ok(resp, audit.toPublic())

  } catch (err) {
    return res.serverError(resp, err, 'getAuditByPublicId')
  }
}

// ─── GET /api/audits/:publicId/summary ───────────────────────────────────────

/**
 * Regenerate the AI summary for an existing audit.
 * Useful if the original generation failed or returned a fallback.
 */
export async function regenerateSummary(req, resp) {
  try {
    const { publicId } = req.params

    const audit = await Audit.findByPublicId(publicId)
    if (!audit) return res.notFound(resp, 'Audit not found')

    // Only regenerate if it was a fallback or missing
    if (audit.aiSummary?.text && !audit.aiSummary?.isFallback) {
      return res.ok(resp, { summary: audit.aiSummary })
    }

    const auditData    = { context: audit.context, tools: audit.tools, findings: audit.findings, metrics: audit.metrics, verdict: audit.verdict }
    const summaryResult = await generateAuditSummary(auditData)

    audit.aiSummary = {
      text:        summaryResult.text,
      generatedAt: new Date(),
      model:       summaryResult.model,
      isFallback:  summaryResult.isFallback,
    }

    await audit.save()

    return res.ok(resp, { summary: audit.aiSummary })

  } catch (err) {
    return res.serverError(resp, err, 'regenerateSummary')
  }
}

// POST /api/audits/summary — generate AI summary without saving
export async function generateSummaryOnly(req, resp) {
  try {
    const { context, findings, metrics, verdict } = req.body
    if (!context || !metrics || !verdict) {
      return res.badRequest(resp, 'Missing required fields')
    }
    const summaryResult = await generateAuditSummary({
      context, tools: [], findings: findings ?? [], metrics, verdict
    })
    return res.ok(resp, summaryResult)
  } catch (err) {
    return res.serverError(resp, err, 'generateSummaryOnly')
  }
}