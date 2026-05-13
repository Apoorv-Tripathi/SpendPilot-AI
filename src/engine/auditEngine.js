/**
 * auditEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * The public API of the audit system. Import and call `runAudit(formState)`.
 *
 * Architecture:
 *   1. Normalise raw form data into typed ToolEntry objects
 *   2. Run all per-tool rules (one finding per rule per tool)
 *   3. Run all cross-tool rules (redundancy, use-case fit)
 *   4. Deduplicate and rank findings
 *   5. Compute aggregate savings & headline metrics
 *   6. Return a structured AuditReport
 *
 * Adding a new rule:
 *   - Write the rule function in auditRules.js
 *   - Import it here
 *   - Add it to PER_TOOL_RULES or CROSS_TOOL_RULES
 *   - Done. No other files need to change.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  ruleEnterprisePlanOnSmallTeam,
  ruleExcessSeats,
  ruleOverpaymentVsListPrice,
  ruleRedundantCodingAssistants,
  ruleRedundantChatAssistants,
  ruleApiAndChatOverlap,
  ruleApiCommittedDiscount,
  ruleWrongToolForUseCase,
  ruleHighCostPerSeat,
  ruleWindsurfVsCursor,
  ruleGeminiWorkspaceAddOn,
  ruleWellPricedTool,
} from './auditRules.js'

import { TOOL_KNOWLEDGE } from './auditKnowledge.js'
import { teamSizeBucket } from './auditHelpers.js'

// ─── Rule registries ──────────────────────────────────────────────────────────

/**
 * Per-tool rules: called once per tool entry.
 * Signature: (toolEntry, context) => Finding | null
 */
const PER_TOOL_RULES = [
  ruleEnterprisePlanOnSmallTeam,
  ruleExcessSeats,
  ruleOverpaymentVsListPrice,
  ruleApiCommittedDiscount,
  ruleHighCostPerSeat,
  ruleGeminiWorkspaceAddOn,
  ruleWellPricedTool,
]

/**
 * Cross-tool rules: called once with ALL tool entries.
 * Signature: (allTools, context) => Finding | Finding[] | null
 */
const CROSS_TOOL_RULES = [
  ruleRedundantCodingAssistants,
  ruleRedundantChatAssistants,
  ruleApiAndChatOverlap,
  ruleWrongToolForUseCase,
  ruleWindsurfVsCursor,
]

// ─── Normalisation ────────────────────────────────────────────────────────────

/**
 * Convert raw form tool entry → typed ToolEntry used by rules.
 * @param {object} rawTool - from useAuditForm hook
 * @returns {object} ToolEntry
 */
function normaliseToolEntry(rawTool) {
  return {
    id:           rawTool.id,
    toolId:       rawTool.toolName,           // matches TOOL_KNOWLEDGE keys
    plan:         rawTool.plan || '',
    monthlySpend: parseFloat(rawTool.monthlySpend) || 0,
    seats:        parseInt(rawTool.seats) || 1,
  }
}

/**
 * Build the audit context object passed to every rule.
 * @param {object} formState
 * @returns {object} AuditContext
 */
function buildContext(formState) {
  return {
    teamSize:       parseInt(formState.teamSize) || 1,
    primaryUseCase: formState.primaryUseCase || 'mixed',
    teamBucket:     teamSizeBucket(parseInt(formState.teamSize) || 1),
  }
}

// ─── Finding deduplication & ranking ─────────────────────────────────────────

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }

/**
 * Remove duplicate finding IDs and sort by severity then savings.
 * @param {object[]} findings
 * @returns {object[]}
 */
function deduplicateAndRank(findings) {
  const seen = new Set()
  const unique = findings.filter(f => {
    if (seen.has(f.id)) return false
    seen.add(f.id)
    return true
  })

  return unique.sort((a, b) => {
    const severityDiff = (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4)
    if (severityDiff !== 0) return severityDiff
    return b.monthlySavings - a.monthlySavings
  })
}

/**
 * If a tool has a cross-tool redundancy finding AND a well-priced finding,
 * suppress the well-priced finding — it's misleading to say a redundant tool is fine.
 * @param {object[]} findings
 * @returns {object[]}
 */
function suppressRedundantHealthyFindings(findings) {
  const toolsWithRealFindings = new Set(
    findings
      .filter(f => f.type !== 'healthy')
      .flatMap(f => f.affectedTools ?? (f.toolId !== 'global' ? [f.toolId] : []))
  )

  return findings.filter(f => {
    if (f.type !== 'healthy') return true
    return !toolsWithRealFindings.has(f.toolId)
  })
}

// ─── Aggregate metrics ────────────────────────────────────────────────────────

/**
 * Roll up all findings into headline numbers.
 * @param {object[]} findings
 * @param {object[]} tools
 * @param {object} context
 * @returns {object} AuditMetrics
 */
function computeMetrics(findings, tools, context) {
  const totalMonthlySpend = tools.reduce((s, t) => s + t.monthlySpend, 0)
  const totalAnnualSpend  = totalMonthlySpend * 12

  // Only count non-opportunity, non-healthy findings toward savings
  const savingsFindings = findings.filter(f => !f.isOpportunity && f.type !== 'healthy')
  const potentialMonthlySavings = savingsFindings.reduce((s, f) => s + (f.monthlySavings || 0), 0)

  // Cap savings at 80% of current spend — more than that would mean "use nothing"
  const cappedMonthlySavings = Math.min(potentialMonthlySavings, totalMonthlySpend * 0.8)
  const potentialAnnualSavings = cappedMonthlySavings * 12

  const savingsPercent = totalMonthlySpend > 0
    ? (cappedMonthlySavings / totalMonthlySpend) * 100
    : 0

  const criticalCount = findings.filter(f => f.severity === 'critical').length
  const highCount     = findings.filter(f => f.severity === 'high').length
  const mediumCount   = findings.filter(f => f.severity === 'medium').length
  const totalFindings = findings.filter(f => f.type !== 'healthy').length

  const perEmployeeCost = context.teamSize > 0
    ? totalMonthlySpend / context.teamSize
    : totalMonthlySpend

  // Score: 100 = perfect, lower = more waste found
  const wasteScore = Math.max(0, Math.round(
    100
    - (criticalCount * 25)
    - (highCount * 15)
    - (mediumCount * 8)
    - Math.min(20, savingsPercent)
  ))

  return {
    totalMonthlySpend,
    totalAnnualSpend,
    potentialMonthlySavings: cappedMonthlySavings,
    potentialAnnualSavings,
    savingsPercent,
    perEmployeeCost,
    criticalCount,
    highCount,
    mediumCount,
    totalFindings,
    wasteScore,
    toolCount: tools.filter(t => t.monthlySpend > 0).length,
  }
}

/**
 * Generate a human-readable headline verdict.
 * @param {object} metrics
 * @returns {{ headline: string, subtext: string, mood: 'excellent'|'good'|'concerning'|'critical' }}
 */
function generateVerdict(metrics) {
  const { wasteScore, potentialMonthlySavings, totalMonthlySpend, savingsPercent } = metrics

  if (totalMonthlySpend === 0) {
    return {
      headline: 'No spend data to analyse',
      subtext: 'Enter monthly spend amounts for your tools to get recommendations.',
      mood: 'good',
    }
  }

  if (wasteScore >= 85) {
    return {
      headline: 'Your AI spend looks healthy',
      subtext: `We found no major issues with your $${totalMonthlySpend.toLocaleString()}/mo AI budget. A few minor optimisations are possible.`,
      mood: 'excellent',
    }
  }

  if (wasteScore >= 65) {
    return {
      headline: `${savingsPercent.toFixed(0)}% of your AI budget could be optimised`,
      subtext: `You're spending $${totalMonthlySpend.toLocaleString()}/mo on AI. With a few plan adjustments, you could recover $${potentialMonthlySavings.toFixed(0)}/mo.`,
      mood: 'good',
    }
  }

  if (wasteScore >= 40) {
    return {
      headline: `Significant waste detected — $${potentialMonthlySavings.toFixed(0)}/mo at risk`,
      subtext: `Your AI stack has structural inefficiencies. Redundant tools and wrong-tier plans are costing your team more than necessary.`,
      mood: 'concerning',
    }
  }

  return {
    headline: `Critical: $${(potentialMonthlySavings * 12).toLocaleString()}/year in preventable spend`,
    subtext: `Your AI budget has multiple high-severity issues. Immediate action on these findings could significantly cut costs without reducing capability.`,
    mood: 'critical',
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Run the full audit on a form submission.
 *
 * @param {object} formState - Raw state from useAuditForm hook
 * @returns {AuditReport}
 *
 * @typedef {Object} AuditReport
 * @property {object}   context   - Normalised context (teamSize, useCase, etc.)
 * @property {object[]} tools     - Normalised tool entries
 * @property {object[]} findings  - Ranked list of Finding objects
 * @property {object}   metrics   - Aggregate numbers
 * @property {object}   verdict   - Headline + mood
 * @property {Date}     generatedAt
 */
export function runAudit(formState) {
  // 1. Normalise
  const context = buildContext(formState)
  const tools   = (formState.tools || [])
    .map(normaliseToolEntry)
    .filter(t => t.toolId) // skip empty rows

  const allFindings = []

  // 2. Per-tool rules
  for (const tool of tools) {
    for (const rule of PER_TOOL_RULES) {
      try {
        const finding = rule(tool, context)
        if (finding) allFindings.push(finding)
      } catch (err) {
        console.warn(`Rule ${rule.name} threw for tool ${tool.toolId}:`, err)
      }
    }
  }

  // 3. Cross-tool rules
  for (const rule of CROSS_TOOL_RULES) {
    try {
      const result = rule(tools, context)
      if (!result) continue
      const resultArr = Array.isArray(result) ? result : [result]
      allFindings.push(...resultArr.filter(Boolean))
    } catch (err) {
      console.warn(`Cross-tool rule ${rule.name} threw:`, err)
    }
  }

  // 4. Post-process
  const deduped   = deduplicateAndRank(allFindings)
  const findings  = suppressRedundantHealthyFindings(deduped)

  // 5. Metrics & verdict
  const metrics = computeMetrics(findings, tools, context)
  const verdict = generateVerdict(metrics)

  return {
    context,
    tools,
    findings,
    metrics,
    verdict,
    generatedAt: new Date(),
  }
}

/**
 * Get findings that apply to a specific tool (including global cross-tool findings).
 * @param {object[]} findings
 * @param {string}   toolId
 * @returns {object[]}
 */
export function findingsForTool(findings, toolId) {
  return findings.filter(f =>
    f.toolId === toolId ||
    (f.affectedTools && f.affectedTools.includes(toolId))
  )
}

/**
 * Group findings by tool for the per-tool result cards.
 * @param {object[]} findings
 * @param {object[]} tools
 * @returns {Map<string, object[]>}
 */
export function groupFindingsByTool(findings, tools) {
  const map = new Map()

  // Initialise with all tools
  for (const tool of tools) {
    map.set(tool.toolId, [])
  }
  map.set('global', [])

  for (const finding of findings) {
    if (finding.toolId === 'global' || finding.affectedTools?.length > 1) {
      map.get('global').push(finding)
      // Also add to each affected tool for the tool card view
      if (finding.affectedTools) {
        for (const tid of finding.affectedTools) {
          if (map.has(tid)) map.get(tid).push(finding)
        }
      }
    } else {
      if (map.has(finding.toolId)) {
        map.get(finding.toolId).push(finding)
      }
    }
  }

  return map
}
