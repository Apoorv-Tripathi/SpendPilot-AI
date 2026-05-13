/**
 * auditHelpers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure, stateless helper functions used by the audit rules.
 * Each function takes data → returns a result. No side-effects.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { TOOL_KNOWLEDGE, REDUNDANCY_GROUPS } from './auditKnowledge.js'

// ─── Plan parsing ────────────────────────────────────────────────────────────

/**
 * Given a plan label string (from the form), find the matching PlanSpec.
 * The form stores plan labels like "Pro ($20/mo)" so we do fuzzy matching.
 *
 * @param {string} toolId
 * @param {string} planLabel - Raw label from form
 * @returns {import('./auditKnowledge.js').PlanSpec | null}
 */
export function resolvePlan(toolId, planLabel) {
  const tool = TOOL_KNOWLEDGE[toolId]
  if (!tool || !planLabel) return null

  const normalized = planLabel.toLowerCase()
  return tool.plans.find(p =>
    normalized.includes(p.id.toLowerCase()) ||
    normalized.includes(p.label.toLowerCase().split(' ')[0])  // match first word
  ) ?? null
}

/**
 * Get the cheapest non-free plan for a tool.
 * @param {string} toolId
 * @returns {import('./auditKnowledge.js').PlanSpec | null}
 */
export function getCheapestPaidPlan(toolId) {
  const tool = TOOL_KNOWLEDGE[toolId]
  if (!tool) return null
  return tool.plans.find(p => p.pricePerSeat > 0) ?? null
}

/**
 * Get the plan one tier below the current one.
 * @param {string} toolId
 * @param {string} currentPlanId
 * @returns {import('./auditKnowledge.js').PlanSpec | null}
 */
export function getDowngradePlan(toolId, currentPlanId) {
  const tool = TOOL_KNOWLEDGE[toolId]
  if (!tool) return null
  const idx = tool.plans.findIndex(p => p.id === currentPlanId)
  if (idx <= 0) return null
  return tool.plans[idx - 1]
}

// ─── Cost calculations ────────────────────────────────────────────────────────

/**
 * Compute expected monthly cost given plan + seats.
 * @param {import('./auditKnowledge.js').PlanSpec} plan
 * @param {number} seats
 * @returns {number} monthly cost in USD
 */
export function computeExpectedCost(plan, seats) {
  if (!plan || plan.isEnterprise) return 0
  const effectiveSeats = Math.max(seats, plan.minSeats)
  return plan.pricePerSeat * effectiveSeats
}

/**
 * Calculate cost per seat.
 * @param {number} totalSpend
 * @param {number} seats
 * @returns {number}
 */
export function costPerSeat(totalSpend, seats) {
  if (!seats || seats <= 0) return totalSpend
  return totalSpend / seats
}

/**
 * Calculate the "AI tax" — spend as a % of assumed average developer salary.
 * Uses $8,333/mo ($100k/year) as baseline.
 * @param {number} spendPerSeat
 * @returns {number} percentage (0–100+)
 */
export function aiTaxPercent(spendPerSeat) {
  const DEV_MONTHLY_SALARY = 8333
  return (spendPerSeat / DEV_MONTHLY_SALARY) * 100
}

// ─── Overspend detection ─────────────────────────────────────────────────────

/**
 * Compare what the user is actually paying vs what the plan should cost.
 * Flags if they're paying >20% above expected (rounding, taxes, etc. are normal).
 *
 * @param {number} actualSpend   - What user entered
 * @param {number} expectedCost  - From plan pricing × seats
 * @returns {{ isOverpaying: boolean, delta: number, deltaPercent: number }}
 */
export function detectOverpayment(actualSpend, expectedCost) {
  if (expectedCost === 0) return { isOverpaying: false, delta: 0, deltaPercent: 0 }
  const delta = actualSpend - expectedCost
  const deltaPercent = (delta / expectedCost) * 100
  return {
    isOverpaying: deltaPercent > 20,
    delta: Math.max(0, delta),
    deltaPercent: Math.max(0, deltaPercent),
  }
}

// ─── Redundancy detection ────────────────────────────────────────────────────

/**
 * Find redundancy groups that the user's active tools overlap.
 * Returns only groups where 2+ tools are active.
 *
 * @param {string[]} activeToolIds
 * @returns {Array<{ group: object, overlappingTools: string[] }>}
 */
export function findRedundancies(activeToolIds) {
  const results = []
  for (const group of REDUNDANCY_GROUPS) {
    const overlapping = group.tools.filter(t => activeToolIds.includes(t))
    if (overlapping.length >= 2) {
      results.push({ group, overlappingTools: overlapping })
    }
  }
  return results
}

/**
 * Among a list of redundant tools, find the cheapest one (by current spend).
 * @param {Array<{ toolId: string, monthlySpend: number }>} tools
 * @returns {{ toolId: string, monthlySpend: number } | null}
 */
export function findCheapestInGroup(tools) {
  if (!tools.length) return null
  return tools.reduce((min, t) => t.monthlySpend < min.monthlySpend ? t : min)
}

// ─── Team size logic ─────────────────────────────────────────────────────────

/**
 * Categorize team size into buckets used by rules.
 * @param {number} teamSize
 * @returns {'solo' | 'small' | 'medium' | 'large' | 'enterprise'}
 */
export function teamSizeBucket(teamSize) {
  if (teamSize <= 1)  return 'solo'
  if (teamSize <= 5)  return 'small'
  if (teamSize <= 20) return 'medium'
  if (teamSize <= 100) return 'large'
  return 'enterprise'
}

/**
 * Check if seats exceed team size (paying for unused seats).
 * @param {number} seats
 * @param {number} teamSize
 * @returns {{ hasExcessSeats: boolean, excessSeats: number }}
 */
export function detectExcessSeats(seats, teamSize) {
  const excess = Math.max(0, seats - teamSize)
  return { hasExcessSeats: excess > 0, excessSeats: excess }
}

// ─── Severity scoring ─────────────────────────────────────────────────────────

/**
 * Assign a severity level to a finding based on potential savings.
 * @param {number} monthlySavings
 * @returns {'critical' | 'high' | 'medium' | 'low' | 'info'}
 */
export function savingsSeverity(monthlySavings) {
  if (monthlySavings >= 500) return 'critical'
  if (monthlySavings >= 200) return 'high'
  if (monthlySavings >= 50)  return 'medium'
  if (monthlySavings > 0)    return 'low'
  return 'info'
}

/**
 * Generate a savings confidence label.
 * @param {'exact' | 'estimate' | 'rough'} confidence
 * @returns {string}
 */
export function confidenceLabel(confidence) {
  const labels = {
    exact:    'Exact savings',
    estimate: 'Estimated savings',
    rough:    'Rough estimate',
  }
  return labels[confidence] ?? 'Potential savings'
}
