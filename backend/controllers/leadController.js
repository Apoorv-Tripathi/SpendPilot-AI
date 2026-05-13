/**
 * leadController.js
 * Handles: POST /api/leads — capture a lead, link to audit, send email
 */

import Lead from '../models/Lead.js'
import Audit from '../models/Audit.js'
import { sendAuditConfirmationEmail } from '../services/emailService.js'
import * as res from '../utils/response.js'

// ─── POST /api/leads ──────────────────────────────────────────────────────────

/**
 * Capture a lead from the results page email gate.
 *
 * Body: {
 *   email, companyName?, role?, teamSize?,
 *   auditPublicId, source?
 * }
 *
 * Flow:
 *   1. Validate the referenced audit exists
 *   2. Check for duplicate lead (same email + audit)
 *   3. Save lead to DB
 *   4. Link leadId back onto the audit document
 *   5. Send confirmation email (async, non-blocking)
 *   6. Return the created lead
 */
export async function createLead(req, resp) {
  try {
    const {
      email,
      companyName = '',
      role        = '',
      teamSize,
      auditPublicId,
      source      = 'audit_results',
    } = req.body

    // ── 1. Validate the audit exists ──────────────────────────────────────────
    const audit = await Audit.findByPublicId(auditPublicId)
    if (!audit) {
      return res.notFound(resp, `No audit found with ID: ${auditPublicId}`)
    }

    // ── 2. Prevent duplicate leads for the same email + audit ─────────────────
    const existing = await Lead.alreadyExists(email, audit._id)
    if (existing) {
      // Return the existing lead silently — don't re-send the email
      console.log(`[Lead] Duplicate suppressed for ${email} on audit ${auditPublicId}`)
      return res.ok(resp, {
        lead: { id: existing._id, email: existing.email },
        duplicate: true,
        message: 'You already submitted your details for this audit.',
      })
    }

    // ── 3. Create the lead ────────────────────────────────────────────────────
    const lead = new Lead({
      email,
      companyName,
      role,
      teamSize:      teamSize ? parseInt(teamSize) : audit.context.teamSize,
      auditId:       audit._id,
      auditPublicId: audit.publicId,
      savingsSnapshot: {
        monthly: audit.metrics.potentialMonthlySavings,
        annual:  audit.metrics.potentialAnnualSavings,
      },
      source,
    })

    await lead.save()

    console.log(`[Lead] Captured → ${email}, audit: ${auditPublicId}`)

    // ── 4. Link lead onto the audit document ──────────────────────────────────
    await Audit.findByIdAndUpdate(audit._id, { leadId: lead._id })

    // ── 5. Send confirmation email (fire-and-forget) ──────────────────────────
    // We intentionally don't await this — email failure must NOT fail the API call.
    sendAuditConfirmationEmail({
      toEmail:       email,
      leadName:      companyName || '',
      auditPublicId: audit.publicId,
      metrics:       audit.metrics,
      context:       audit.context,
      aiSummary:     audit.aiSummary?.text ?? '',
    })
      .then(result => {
        if (result.success) {
          lead.markEmailSent(result.messageId).catch(() => {})
        } else {
          lead.markEmailFailed(result.error).catch(() => {})
        }
      })
      .catch(err => {
        console.error('[Lead] Email fire-and-forget failed:', err.message)
        lead.markEmailFailed(err.message).catch(() => {})
      })

    // ── 6. Respond immediately ────────────────────────────────────────────────
    return res.created(resp, {
      lead: {
        id:    lead._id,
        email: lead.email,
      },
      message: 'Your audit report has been saved. Check your email for a summary.',
    })

  } catch (err) {
    if (err.name === 'ValidationError') {
      const details = Object.values(err.errors).map(e => e.message)
      return res.badRequest(resp, 'Lead validation failed', details)
    }

    // Unique index violation (race condition duplicate)
    if (err.code === 11000) {
      return res.conflict(resp, 'You already submitted your details for this audit.')
    }

    return res.serverError(resp, err, 'createLead')
  }
}
