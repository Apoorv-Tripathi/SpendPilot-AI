/**
 * emailService.js
 * Sends transactional confirmation emails via Resend.
 * Returns success/failure without throwing — callers never crash due to email.
 */

import { getResendClient, FROM_EMAIL } from '../config/resend.js'

// ─── Currency formatter ───────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

// ─── HTML Email Template ──────────────────────────────────────────────────────

/**
 * Build a professional HTML email for the audit confirmation.
 *
 * @param {object} params
 * @returns {string} HTML string
 */
function buildAuditEmailHtml({ leadName, auditUrl, metrics, aiSummary, context }) {
  const monthly = fmt(metrics.potentialMonthlySavings)
  const annual  = fmt(metrics.potentialAnnualSavings)
  const total   = fmt(metrics.totalMonthlySpend)
  const score   = metrics.wasteScore
  const team    = context.teamSize

  const scoreColor =
    score >= 75 ? '#34d399' :
    score >= 50 ? '#C8F135' :
    score >= 35 ? '#fb923c' : '#f87171'

  const moodBadge = {
    excellent:  { label: 'Healthy',       bg: '#064e3b', color: '#34d399' },
    good:       { label: 'Savings Found', bg: '#1a2e05', color: '#C8F135' },
    concerning: { label: 'Action Needed', bg: '#431407', color: '#fb923c' },
    critical:   { label: 'Critical Waste',bg: '#450a0a', color: '#f87171' },
  }[metrics.wasteScore >= 85 ? 'excellent' : metrics.potentialMonthlySavings >= 500 ? 'critical' : 'good'] ?? { label: 'Reviewed', bg: '#1e1e2e', color: '#C8F135' }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your AI Spend Audit — SpendLens</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'DM Sans',system-ui,sans-serif;color:#ffffff;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo header -->
          <tr>
            <td style="padding-bottom:32px;" align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#C8F135;border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                    <span style="font-size:18px;line-height:36px;">⚡</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                      Spend<span style="color:#C8F135;">Lens</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background:#12121A;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px 36px;">

              <!-- Badge -->
              <div style="margin-bottom:24px;">
                <span style="display:inline-block;background:${moodBadge.bg};color:${moodBadge.color};border:1px solid ${moodBadge.color}40;border-radius:100px;padding:4px 14px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
                  ${moodBadge.label}
                </span>
              </div>

              <!-- Greeting -->
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;line-height:1.2;color:#ffffff;">
                Your audit report is ready${leadName ? `, ${leadName.split(' ')[0]}` : ''}.
              </h1>
              <p style="margin:0 0 32px;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;">
                Here's a summary of what SpendLens found for your ${team}-person team.
              </p>

              <!-- Stats row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td width="33%" style="padding-right:8px;">
                    <div style="background:#0A0A0F;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 16px;">
                      <div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Monthly savings</div>
                      <div style="font-size:22px;font-weight:800;color:#C8F135;">${monthly}</div>
                    </div>
                  </td>
                  <td width="33%" style="padding:0 4px;">
                    <div style="background:#0A0A0F;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 16px;">
                      <div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Annual savings</div>
                      <div style="font-size:22px;font-weight:800;color:#ffffff;">${annual}</div>
                    </div>
                  </td>
                  <td width="33%" style="padding-left:8px;">
                    <div style="background:#0A0A0F;border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:18px 16px;">
                      <div style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Waste score</div>
                      <div style="font-size:22px;font-weight:800;color:${scoreColor};">${score}<span style="font-size:13px;font-weight:400;color:rgba(255,255,255,0.3);">/100</span></div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- AI Summary -->
              <div style="background:#0A0A0F;border:1px solid rgba(200,241,53,0.12);border-left:3px solid #C8F135;border-radius:14px;padding:20px 22px;margin-bottom:32px;">
                <div style="font-size:10px;color:rgba(200,241,53,0.6);text-transform:uppercase;letter-spacing:0.08em;font-weight:600;margin-bottom:10px;">AI-Generated Summary</div>
                <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.7);">
                  ${aiSummary}
                </p>
              </div>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${auditUrl}"
                       style="display:inline-block;background:#C8F135;color:#0A0A0F;font-weight:700;font-size:14px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.02em;">
                      View Full Report →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);text-align:center;line-height:1.6;">
                Or copy this link: <a href="${auditUrl}" style="color:rgba(200,241,53,0.6);text-decoration:none;">${auditUrl}</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.2);">
                You're receiving this because you ran an AI spend audit on SpendLens.
              </p>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.15);">
                Your data is stored locally in your browser and not shared with third parties.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ─── Plain text fallback ──────────────────────────────────────────────────────

function buildAuditEmailText({ leadName, auditUrl, metrics, aiSummary, context }) {
  const monthly = fmt(metrics.potentialMonthlySavings)
  const annual  = fmt(metrics.potentialAnnualSavings)
  const name    = leadName ? ` ${leadName.split(' ')[0]}` : ''

  return `SpendLens — Your AI Spend Audit

Hi${name},

Your audit report is ready for your ${context.teamSize}-person team.

SUMMARY
${aiSummary}

KEY NUMBERS
• Monthly savings potential: ${monthly}
• Annual savings potential: ${annual}
• Waste score: ${metrics.wasteScore}/100
• Total findings: ${metrics.totalFindings}

View your full report here:
${auditUrl}

—
SpendLens · AI Spend Intelligence
You received this because you ran an audit on SpendLens.
`
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Send the audit confirmation email to a lead.
 *
 * @param {object} params
 * @param {string} params.toEmail      - Recipient email
 * @param {string} params.leadName     - Recipient name (optional)
 * @param {string} params.auditPublicId
 * @param {object} params.metrics      - From audit report
 * @param {object} params.context      - From audit report
 * @param {string} params.aiSummary    - AI or fallback summary text
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendAuditConfirmationEmail({
  toEmail,
  leadName = '',
  auditPublicId,
  metrics,
  context,
  aiSummary,
}) {
  const resend = getResendClient()

  if (!resend) {
    console.warn('[Email] Resend not configured — skipping email.')
    return { success: false, error: 'Email service not configured' }
  }

  const auditUrl = `${process.env.FRONTEND_URL}/results/${auditPublicId}`

  const templateData = { leadName, auditUrl, metrics, context, aiSummary }

  try {
    const { data, error } = await resend.emails.send({
      from:    FROM_EMAIL,
      to:      toEmail,
      subject: `Your AI Spend Audit — ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(metrics.potentialAnnualSavings)} potential savings found`,
      html:    buildAuditEmailHtml(templateData),
      text:    buildAuditEmailText(templateData),
    })

    if (error) {
      console.error('[Email] Resend API error:', error)
      return { success: false, error: error.message ?? 'Unknown Resend error' }
    }

    console.log(`[Email] Sent to ${toEmail} — Resend ID: ${data.id}`)
    return { success: true, messageId: data.id }

  } catch (err) {
    console.error('[Email] Unexpected error:', err.message)
    return { success: false, error: err.message }
  }
}
