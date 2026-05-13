/**
 * geminiService.js  (now powered by Groq — filename kept for compatibility)
 * Generates a personalised ~100-word audit summary using Groq (Llama 3.1).
 * Always returns a string — failures fall back to a hardcoded summary.
 */

import { getGroqClient, GROQ_MODEL, GROQ_TIMEOUT_MS } from '../config/groq.js'

// ─── Fallback summary (no AI needed) ─────────────────────────────────────────

function buildFallbackSummary(auditData) {
  const { metrics, context, verdict } = auditData
  const monthly = metrics.potentialMonthlySavings.toFixed(0)
  const annual = metrics.potentialAnnualSavings.toFixed(0)
  const team = context.teamSize
  const useCase = context.primaryUseCase
  const tools = metrics.toolCount
  const score = metrics.wasteScore
  const findings = metrics.totalFindings

  if (metrics.totalMonthlySpend === 0) {
    return `Your SpendLens audit is complete. No spend data was provided, so no savings opportunities could be identified. Re-run the audit with accurate monthly spend figures for each AI tool your team uses.`
  }

  if (findings === 0) {
    return `Your SpendLens audit reviewed ${tools} AI tool${tools !== 1 ? 's' : ''} used by your ${team}-person ${useCase} team and found no significant issues. Your AI budget appears well-optimised with a waste score of ${score}/100. Continue monitoring quarterly as pricing and team needs evolve.`
  }

  return `Your SpendLens audit identified $${monthly}/month ($${annual}/year) in potential savings across ${tools} AI tool${tools !== 1 ? 's' : ''} for your ${team}-person ${useCase} team. With ${findings} finding${findings !== 1 ? 's' : ''} and a waste score of ${score}/100, ${verdict.mood === 'critical' || verdict.mood === 'concerning' ? 'immediate action is recommended' : 'a few targeted changes could meaningfully reduce your AI spend'}. Review the detailed recommendations in your report to prioritise next steps.`
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(auditData) {
  const { metrics, context, findings, verdict } = auditData

  const topFindings = findings
    .filter(f => f.type !== 'healthy' && f.monthlySavings > 0)
    .slice(0, 3)
    .map(f => `- ${f.title} (save $${f.monthlySavings.toFixed(0)}/mo)`)
    .join('\n')

  return `You are a financial advisor specialising in AI tooling costs. Write a professional, personalised audit summary in EXACTLY 100 words. Be specific, honest, and actionable. Plain paragraph only — no markdown, no bullet points, no headers.

AUDIT DATA:
- Team: ${context.teamSize} people, primary use case: ${context.primaryUseCase}
- Total monthly AI spend: $${metrics.totalMonthlySpend.toFixed(0)}
- Potential monthly savings: $${metrics.potentialMonthlySavings.toFixed(0)}
- Potential annual savings: $${metrics.potentialAnnualSavings.toFixed(0)}
- Waste score: ${metrics.wasteScore}/100 (100 = perfect, lower = more waste)
- Total findings: ${metrics.totalFindings} (${metrics.criticalCount} critical, ${metrics.highCount} high)
- Verdict: ${verdict.mood}

TOP FINDINGS:
${topFindings || '- No major issues found'}

Write the summary now:`
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateAuditSummary(auditData) {
  const client = getGroqClient()

  if (!client) {
    return { text: buildFallbackSummary(auditData), isFallback: true, model: 'fallback' }
  }

  try {
    const prompt = buildPrompt(auditData)

    const result = await client.chat.completions.create(
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a financial advisor specialising in AI tooling costs. Write a professional, personalised audit summary in exactly 100 words. Be specific, honest, and actionable. Use only plain paragraph text.'
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      },
      { timeout: GROQ_TIMEOUT_MS }
    )

    const text =
      result?.choices?.[0]?.message?.content?.trim() ||
      result?.output?.[0]?.content?.[0]?.text?.trim() ||
      result?.output_text?.trim()

    if (!text || text.length < 50) {
      throw new Error('Groq returned empty response')
    }

    console.log(`[Groq] Summary generated (${text.split(/\s+/).filter(Boolean).length} words)`)
    return { text, isFallback: false, model: GROQ_MODEL }
  } catch (err) {
    console.error('[Groq] Failed to generate summary:', err?.message || err)
    return { text: buildFallbackSummary(auditData), isFallback: true, model: 'fallback' }
  }
}
