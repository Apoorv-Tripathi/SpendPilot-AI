/**
 * ogRoutes.js
 * Serves a minimal HTML page with dynamic Open Graph meta tags for shared audits.
 * Social crawlers (Twitter, LinkedIn, Slack) hit this URL and read the OG tags.
 * The React app handles the actual user-facing UI.
 */

import { Router } from 'express'
import Audit from '../models/Audit.js'

const router = Router()

const SITE_NAME = 'SpendLens'
const SITE_URL  = process.env.FRONTEND_URL || 'https://spendlens.app'

function fmt(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0,
  }).format(n)
}

/**
 * GET /og/audit/:publicId
 * Returns a lightweight HTML page with OG + Twitter Card meta tags.
 * The page immediately redirects the user to the React app.
 */
router.get('/audit/:publicId', async (req, res) => {
  const { publicId } = req.params

  try {
    const audit = await Audit.findByPublicId(publicId)

    if (!audit) {
      return res.status(404).send('Not found')
    }

    const { metrics, context, verdict } = audit
    const annual   = fmt(metrics.potentialAnnualSavings)
    const monthly  = fmt(metrics.potentialMonthlySavings)
    const total    = fmt(metrics.totalMonthlySpend)
    const teamSize = context.teamSize
    const useCase  = context.primaryUseCase
    const score    = metrics.wasteScore

    const ogTitle = `AI Spend Audit — ${annual} in potential savings`
    const ogDesc  = `A ${teamSize}-person ${useCase} team spending ${total}/mo on AI. Waste score: ${score}/100. ${metrics.totalFindings} issue${metrics.totalFindings !== 1 ? 's' : ''} identified by SpendLens.`
    const pageUrl = `${SITE_URL}/shared/${publicId}`

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${ogTitle} — ${SITE_NAME}</title>
  <meta name="description" content="${ogDesc}" />

  <!-- Open Graph -->
  <meta property="og:type"        content="article" />
  <meta property="og:title"       content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  <meta property="og:url"         content="${pageUrl}" />
  <meta property="og:site_name"   content="${SITE_NAME}" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDesc}" />
  <meta name="twitter:site"        content="@spendlens" />

  <!-- Structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Report",
    "name": "${ogTitle}",
    "description": "${ogDesc}",
    "url": "${pageUrl}",
    "publisher": {
      "@type": "Organization",
      "name": "${SITE_NAME}",
      "url": "${SITE_URL}"
    }
  }
  </script>

  <!-- Redirect real users to the React app immediately -->
  <meta http-equiv="refresh" content="0; url=${pageUrl}" />
</head>
<body>
  <p>Redirecting to audit report… <a href="${pageUrl}">Click here</a> if not redirected.</p>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600') // 1 hour cache
    res.send(html)

  } catch (err) {
    console.error('[OG] Error generating meta page:', err.message)
    res.status(500).send('Server error')
  }
})

export default router
