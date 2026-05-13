/**
 * auditRules.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Each exported function is a RULE. Rules are pure functions:
 *   (context) => Finding | null
 *
 * A rule returns null if the condition doesn't apply.
 * Rules are composable and independently testable.
 *
 * Finding schema:
 * {
 *   id:               string      — unique finding ID
 *   toolId:           string      — which tool this applies to (or 'global')
 *   type:             string      — category of finding
 *   severity:         string      — 'critical' | 'high' | 'medium' | 'low' | 'info'
 *   title:            string      — short label
 *   description:      string      — 1-2 sentence explanation
 *   reasoning:        string      — WHY this is a problem (the honest rationale)
 *   action:           string      — concrete thing to do
 *   monthlySavings:   number      — USD saved per month (can be 0)
 *   confidence:       string      — 'exact' | 'estimate' | 'rough'
 *   tag:              string      — UI badge label
 *   alternativeTool?: string      — tool ID to switch to
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { TOOL_KNOWLEDGE } from './auditKnowledge.js'
import {
  resolvePlan,
  getDowngradePlan,
  computeExpectedCost,
  detectOverpayment,
  detectExcessSeats,
  teamSizeBucket,
  findRedundancies,
  costPerSeat,
  savingsSeverity,
} from './auditHelpers.js'

// ─── Rule: Wrong plan for team size ─────────────────────────────────────────

/**
 * Small teams on Business/Enterprise plans often get no value from the extra
 * seat minimums or admin features.
 */
export function ruleEnterprisePlanOnSmallTeam(toolEntry, context) {
  const { teamSize } = context
  const { toolId, plan, monthlySpend, seats } = toolEntry
  const spec = TOOL_KNOWLEDGE[toolId]
  if (!spec) return null

  const resolvedPlan = resolvePlan(toolId, plan)
  if (!resolvedPlan) return null

  const bucket = teamSizeBucket(teamSize)
  const isEnterpriseTier = resolvedPlan.isEnterprise || resolvedPlan.id === 'enterprise'
  const isBusinessTier = resolvedPlan.id === 'business'

  // Enterprise on small/medium team
  if (isEnterpriseTier && (bucket === 'solo' || bucket === 'small' || bucket === 'medium')) {
    const downgrade = getDowngradePlan(toolId, resolvedPlan.id)
    if (!downgrade) return null
    const downgradeCost = computeExpectedCost(downgrade, seats || teamSize)
    const savings = Math.max(0, monthlySpend - downgradeCost)

    return {
      id: `enterprise-small-team-${toolId}`,
      toolId,
      type: 'wrong-plan',
      severity: savingsSeverity(savings),
      title: `Enterprise plan for a ${teamSize}-person team`,
      description: `You're on ${spec.name}'s Enterprise tier with only ${teamSize} team members. Enterprise plans are designed for 50+ seat organizations with SSO and compliance requirements.`,
      reasoning: `The ${downgrade.label} plan includes all the features a ${bucket} team needs. Enterprise adds centralized security controls, audit logs, and SLAs — features that only matter at significant scale. You're paying for organizational overhead your team doesn't use.`,
      action: `Downgrade to ${spec.name} ${downgrade.label} — all the same AI capability at a lower cost.`,
      monthlySavings: savings,
      confidence: 'estimate',
      tag: 'Wrong Plan',
      suggestedPlan: downgrade.label,
    }
  }

  // Business plan on solo/small team where Pro would suffice
  if (isBusinessTier && bucket === 'solo' && seats <= 2) {
    const downgrade = getDowngradePlan(toolId, resolvedPlan.id)
    if (!downgrade || downgrade.pricePerSeat === 0) return null
    const downgradeCost = computeExpectedCost(downgrade, 1)
    const savings = Math.max(0, monthlySpend - downgradeCost)
    if (savings < 5) return null

    return {
      id: `business-solo-${toolId}`,
      toolId,
      type: 'wrong-plan',
      severity: savingsSeverity(savings),
      title: `Business plan for a solo user`,
      description: `${spec.name} Business is optimized for team management. Solo users get the same AI features on the ${downgrade.label} plan.`,
      reasoning: `Business/Team plans add admin dashboards, centralized billing, and usage controls — all valuable when managing multiple users, but wasted on a single seat. The AI models and rate limits are identical.`,
      action: `Switch to ${spec.name} ${downgrade.label} — save ${savings.toFixed(0)}/month without losing any AI capability.`,
      monthlySavings: savings,
      confidence: 'exact',
      tag: 'Downgrade Available',
      suggestedPlan: downgrade.label,
    }
  }

  return null
}

// ─── Rule: Excess seats ──────────────────────────────────────────────────────

/**
 * Paying for more seats than team members.
 */
export function ruleExcessSeats(toolEntry, context) {
  const { teamSize } = context
  const { toolId, plan, monthlySpend, seats } = toolEntry
  if (!seats || seats <= 1) return null

  const spec = TOOL_KNOWLEDGE[toolId]
  if (!spec) return null

  const resolvedPlan = resolvePlan(toolId, plan)
  if (!resolvedPlan || resolvedPlan.isEnterprise) return null

  const { hasExcessSeats, excessSeats } = detectExcessSeats(seats, teamSize)
  if (!hasExcessSeats || excessSeats < 1) return null

  const excessCost = excessSeats * resolvedPlan.pricePerSeat
  if (excessCost < 10) return null

  return {
    id: `excess-seats-${toolId}`,
    toolId,
    type: 'excess-seats',
    severity: savingsSeverity(excessCost),
    title: `${excessSeats} unused ${excessSeats === 1 ? 'seat' : 'seats'} on ${spec.name}`,
    description: `You have ${seats} ${spec.name} seats but only ${teamSize} team members. That's ${excessSeats} seats you're paying for but no one is using.`,
    reasoning: `Unused seats are pure waste — no one is logging in, generating value, or building habits. This often happens when teams overprovisioned during onboarding and forgot to trim licenses.`,
    action: `Remove ${excessSeats} unused ${excessSeats === 1 ? 'seat' : 'seats'} from your ${spec.name} subscription — contact billing or adjust in your dashboard.`,
    monthlySavings: excessCost,
    confidence: 'exact',
    tag: 'Unused Seats',
  }
}

// ─── Rule: Overpayment vs. list price ────────────────────────────────────────

/**
 * User is paying significantly more than published pricing.
 * Could be taxes, legacy pricing, or billing errors.
 */
export function ruleOverpaymentVsListPrice(toolEntry, context) {
  const { toolId, plan, monthlySpend, seats } = toolEntry
  const spec = TOOL_KNOWLEDGE[toolId]
  if (!spec) return null

  const resolvedPlan = resolvePlan(toolId, plan)
  if (!resolvedPlan || resolvedPlan.isEnterprise || resolvedPlan.pricePerSeat === 0) return null

  const effectiveSeats = Math.max(seats || 1, resolvedPlan.minSeats)
  const expectedCost = computeExpectedCost(resolvedPlan, effectiveSeats)
  const { isOverpaying, delta, deltaPercent } = detectOverpayment(monthlySpend, expectedCost)

  if (!isOverpaying || delta < 15) return null

  return {
    id: `overpayment-${toolId}`,
    toolId,
    type: 'billing-anomaly',
    severity: savingsSeverity(delta),
    title: `Paying ${deltaPercent.toFixed(0)}% above list price for ${spec.name}`,
    description: `You're spending $${monthlySpend}/mo on ${spec.name} ${resolvedPlan.label}, but list price for ${effectiveSeats} seat${effectiveSeats > 1 ? 's' : ''} is $${expectedCost}/mo.`,
    reasoning: `A ${deltaPercent.toFixed(0)}% premium over published pricing is unusual. Common causes: local taxes (typically 5–20%), a legacy contract, add-ons you forgot about, or an accidental double charge. This is worth investigating.`,
    action: `Review your ${spec.name} invoice line by line. Check for hidden add-ons, verify your seat count, and confirm you're not on a legacy plan.`,
    monthlySavings: delta,
    confidence: 'rough',
    tag: 'Billing Anomaly',
  }
}

// ─── Rule: Redundant coding assistants ───────────────────────────────────────

/**
 * Having multiple AI coding assistants (Cursor + Copilot + Windsurf).
 */
export function ruleRedundantCodingAssistants(allTools, context) {
  const codingTools = ['cursor', 'github-copilot', 'windsurf']
  const active = allTools.filter(t => codingTools.includes(t.toolId) && t.monthlySpend > 0)
  if (active.length < 2) return null

  const totalSpend = active.reduce((s, t) => s + t.monthlySpend, 0)
  // Keep the most expensive (likely most featured), drop the rest
  const sorted = [...active].sort((a, b) => b.monthlySpend - a.monthlySpend)
  const keep = sorted[0]
  const eliminate = sorted.slice(1)
  const savings = eliminate.reduce((s, t) => s + t.monthlySpend, 0)

  const keepSpec = TOOL_KNOWLEDGE[keep.toolId]
  const toolNames = active.map(t => TOOL_KNOWLEDGE[t.toolId]?.name).join(', ')

  return {
    id: 'redundant-coding-assistants',
    toolId: 'global',
    type: 'redundancy',
    severity: savingsSeverity(savings),
    title: `${active.length} overlapping coding assistants`,
    description: `You're running ${toolNames} simultaneously — all of them autocomplete code and provide AI chat in your IDE.`,
    reasoning: `Cursor, GitHub Copilot, and Windsurf all do the same core job: AI autocomplete and chat in your editor. Running two or more creates confusion (which AI do you ask?), plugin conflicts, and context-switching overhead — while doubling your spend. Most engineering teams that try multiple tools consolidate to one within 90 days.`,
    action: `Pick one coding assistant and cancel the rest. ${keepSpec?.name} is your highest-spend option, suggesting it's the most-used. Consolidate there and save $${savings.toFixed(0)}/mo.`,
    monthlySavings: savings,
    confidence: 'exact',
    tag: 'Redundant Tools',
    affectedTools: active.map(t => t.toolId),
  }
}

// ─── Rule: Redundant chat assistants ─────────────────────────────────────────

/**
 * Paying for 2+ general chat AI tools (Claude + ChatGPT + Gemini).
 */
export function ruleRedundantChatAssistants(allTools, context) {
  const chatTools = ['claude', 'chatgpt', 'gemini']
  const active = allTools.filter(t => chatTools.includes(t.toolId) && t.monthlySpend > 0)
  if (active.length < 2) return null

  const sorted = [...active].sort((a, b) => b.monthlySpend - a.monthlySpend)
  const keep = sorted[0]
  const eliminate = sorted.slice(1)
  const savings = eliminate.reduce((s, t) => s + t.monthlySpend, 0)

  const keepSpec = TOOL_KNOWLEDGE[keep.toolId]
  const toolNames = active.map(t => TOOL_KNOWLEDGE[t.toolId]?.name).join(', ')
  const { primaryUseCase } = context

  // Honest note: sometimes teams legitimately need 2 (different models for different tasks)
  const isLikelyLegitimate = context.teamSize >= 10 && active.length === 2

  if (isLikelyLegitimate) {
    return {
      id: 'redundant-chat-assistants',
      toolId: 'global',
      type: 'redundancy',
      severity: 'low',
      title: `2 general AI assistants — may be intentional`,
      description: `You're subscribed to both ${toolNames}. For a ${context.teamSize}-person team, this might be intentional if different roles prefer different tools.`,
      reasoning: `Some teams keep Claude for writing/analysis and ChatGPT for coding tasks, or vice versa. This can be legitimate. But if your team defaults to one tool and ignores the other, you're leaving money on the table. Worth auditing actual usage in your billing dashboards.`,
      action: `Check usage stats in each tool's admin dashboard. If one tool gets <20% of sessions, cancel it — you're paying for preference, not performance.`,
      monthlySavings: savings,
      confidence: 'rough',
      tag: 'Possible Redundancy',
      affectedTools: active.map(t => t.toolId),
    }
  }

  return {
    id: 'redundant-chat-assistants',
    toolId: 'global',
    type: 'redundancy',
    severity: savingsSeverity(savings),
    title: `${active.length} general AI chat tools`,
    description: `You're paying for ${toolNames} — all capable of writing, research, analysis, and Q&A.`,
    reasoning: `Claude, ChatGPT, and Gemini have significant capability overlap for everyday tasks. While each has model-specific strengths, most teams don't exploit those differences in practice — they just use whichever tab is open. Standardizing on one reduces cognitive overhead and cost.`,
    action: `Pick your team's preferred assistant and consolidate. ${keepSpec?.name} is your biggest AI chat spend — lean into it and cancel the others.`,
    monthlySavings: savings,
    confidence: 'estimate',
    tag: 'Redundant Tools',
    affectedTools: active.map(t => t.toolId),
  }
}

// ─── Rule: API + chat tool overlap ───────────────────────────────────────────

/**
 * Paying for both the API and the chat product of the same provider.
 * This is fine for devs, but flagged when API usage is low.
 */
export function ruleApiAndChatOverlap(allTools, context) {
  const findings = []

  const pairs = [
    { apiId: 'anthropic-api', chatId: 'claude', provider: 'Anthropic' },
    { apiId: 'openai-api',    chatId: 'chatgpt', provider: 'OpenAI' },
  ]

  for (const { apiId, chatId, provider } of pairs) {
    const apiTool  = allTools.find(t => t.toolId === apiId)
    const chatTool = allTools.find(t => t.toolId === chatId)

    if (!apiTool || !chatTool) continue
    if (apiTool.monthlySpend <= 0 || chatTool.monthlySpend <= 0) continue

    const spec = TOOL_KNOWLEDGE[apiId]
    const lowThreshold = spec?.apiThresholds?.lowUsage ?? 50

    if (apiTool.monthlySpend < lowThreshold) {
      // Low API usage + paying for chat = the chat product already covers their needs
      findings.push({
        id: `api-chat-overlap-${apiId}`,
        toolId: apiId,
        type: 'redundancy',
        severity: 'medium',
        title: `Low ${provider} API spend alongside ${provider === 'Anthropic' ? 'Claude' : 'ChatGPT'} subscription`,
        description: `You're spending $${apiTool.monthlySpend}/mo on the ${provider} API but also $${chatTool.monthlySpend}/mo on ${provider === 'Anthropic' ? 'Claude' : 'ChatGPT'}. At this API spend level, you may not need both.`,
        reasoning: `Below $${lowThreshold}/mo in API usage typically means you're using the API for occasional scripts or experiments — not a production system. The ${provider === 'Anthropic' ? 'Claude' : 'ChatGPT'} app already gives you the same models. Unless you're building something that specifically requires API access, the chat app covers your needs.`,
        action: `Audit what your ${provider} API is being used for. If it's just for one-off scripts or experiments, the team's ${provider === 'Anthropic' ? 'Claude' : 'ChatGPT'} app access already provides this. Consider cancelling the API subscription.`,
        monthlySavings: apiTool.monthlySpend,
        confidence: 'rough',
        tag: 'Low API Usage',
      })
    }
  }

  return findings
}

// ─── Rule: High API spend → committed discount ────────────────────────────────

/**
 * API users spending enough to qualify for committed usage discounts.
 */
export function ruleApiCommittedDiscount(toolEntry, context) {
  const { toolId, monthlySpend } = toolEntry
  const spec = TOOL_KNOWLEDGE[toolId]
  if (!spec || spec.category !== 'api') return null

  const threshold = spec.apiThresholds?.committedMin ?? 5000
  if (monthlySpend < threshold) return null

  const discountRate = 0.25 // ~25% discount on committed usage (conservative estimate)
  const savings = monthlySpend * discountRate

  const providerName = toolId === 'anthropic-api' ? 'Anthropic' : 'OpenAI'

  return {
    id: `api-committed-discount-${toolId}`,
    toolId,
    type: 'pricing-optimization',
    severity: savingsSeverity(savings),
    title: `Negotiate committed usage discount with ${providerName}`,
    description: `At $${monthlySpend.toLocaleString()}/mo, you qualify for ${providerName}'s committed usage program, which offers 20–30% discounts.`,
    reasoning: `Both Anthropic and OpenAI offer volume discounts for customers who commit to a minimum monthly spend. At $${monthlySpend.toLocaleString()}/mo you're spending enough that even a 20% discount saves ${savings > 1000 ? `over $${(savings / 1000).toFixed(0)}k` : `$${savings.toFixed(0)}`}/month — with no change to your stack.`,
    action: `Contact ${providerName} sales (${providerName === 'Anthropic' ? 'sales@anthropic.com' : 'sales@openai.com'}) and ask about committed usage pricing. Come with 3 months of spend data to negotiate effectively.`,
    monthlySavings: savings,
    confidence: 'rough',
    tag: 'Discount Eligible',
  }
}

// ─── Rule: Wrong tool for use case ───────────────────────────────────────────

/**
 * Team's primary use case suggests a better-fit tool than what they have.
 */
export function ruleWrongToolForUseCase(allTools, context) {
  const findings = []
  const { primaryUseCase, teamSize } = context
  const activeToolIds = allTools.map(t => t.toolId)

  // Coding teams without a coding assistant
  if (primaryUseCase === 'coding') {
    const hasCodingTool = activeToolIds.some(id => ['cursor', 'github-copilot', 'windsurf'].includes(id))
    const hasOnlyChat = activeToolIds.some(id => ['claude', 'chatgpt', 'gemini'].includes(id))

    if (!hasCodingTool && hasOnlyChat) {
      const chatSpend = allTools
        .filter(t => ['claude', 'chatgpt', 'gemini'].includes(t.toolId))
        .reduce((s, t) => s + t.monthlySpend, 0)

      findings.push({
        id: 'no-coding-assistant',
        toolId: 'global',
        type: 'missing-tool',
        severity: 'medium',
        title: 'Coding team using general chat AI — missing a coding assistant',
        description: `Your primary use case is coding, but you don't have a dedicated coding assistant. You're relying on ${allTools.map(t => TOOL_KNOWLEDGE[t.toolId]?.name).filter(Boolean).join('/')} for development work.`,
        reasoning: `General chat AI tools (Claude, ChatGPT, Gemini) are excellent for many tasks, but they lack IDE integration, file context awareness, and autocomplete — the features that make coding assistants 2–3× faster for development work. At $20/seat, Cursor or Copilot typically pays for itself in saved developer time within the first week.`,
        action: `Try Cursor (starts at $20/seat/mo) or GitHub Copilot ($10/seat/mo). Most teams report 20–30% coding speed improvement. Both offer free trials.`,
        monthlySavings: 0,
        confidence: 'estimate',
        tag: 'Better Tool Available',
        isOpportunity: true,
      })
    }
  }

  // Writing/content teams paying for coding-heavy tools
  if (primaryUseCase === 'writing') {
    const hasCodingTool = activeToolIds.some(id => ['cursor', 'windsurf'].includes(id))
    if (hasCodingTool) {
      const codingTool = allTools.find(t => ['cursor', 'windsurf'].includes(t.toolId))
      findings.push({
        id: 'writing-team-coding-tool',
        toolId: codingTool.toolId,
        type: 'misaligned-tool',
        severity: 'medium',
        title: `${TOOL_KNOWLEDGE[codingTool.toolId]?.name} may be poor ROI for a writing team`,
        description: `Your team's primary use is writing/content, but you're paying for ${TOOL_KNOWLEDGE[codingTool.toolId]?.name} — a tool built specifically for software development.`,
        reasoning: `Coding assistants are optimized for code: they understand codebases, suggest syntax, and integrate with your editor. For content creation, they offer little advantage over Claude or ChatGPT, which are specifically tuned for long-form writing, tone adjustment, and research.`,
        action: `If no one on your team writes code, cancel ${TOOL_KNOWLEDGE[codingTool.toolId]?.name} and allocate that budget toward a higher Claude or ChatGPT tier instead.`,
        monthlySavings: codingTool.monthlySpend,
        confidence: 'rough',
        tag: 'Misaligned Tool',
      })
    }
  }

  return findings
}

// ─── Rule: High cost per seat ─────────────────────────────────────────────────

/**
 * Flag when per-seat cost exceeds reasonable benchmarks.
 */
export function ruleHighCostPerSeat(toolEntry, context) {
  const { toolId, monthlySpend, seats, plan } = toolEntry
  const spec = TOOL_KNOWLEDGE[toolId]
  if (!spec || spec.category === 'api') return null
  if (!seats || seats < 1) return null

  const cps = costPerSeat(monthlySpend, seats)

  // Chat tools: >$50/seat is high. Coding tools: >$60/seat is high.
  const threshold = spec.category === 'coding' ? 60 : 50
  if (cps <= threshold) return null

  const resolvedPlan = resolvePlan(toolId, plan)
  const downgrade = resolvedPlan ? getDowngradePlan(toolId, resolvedPlan.id) : null
  const potential = downgrade ? (cps - downgrade.pricePerSeat) * seats : 0

  return {
    id: `high-cost-per-seat-${toolId}`,
    toolId,
    type: 'cost-per-seat',
    severity: 'medium',
    title: `$${cps.toFixed(0)}/seat/mo on ${spec.name} is above market average`,
    description: `You're paying $${cps.toFixed(2)} per seat per month for ${spec.name}. Most teams using this tool pay $${resolvedPlan?.pricePerSeat ?? 20}–${threshold}/seat.`,
    reasoning: `High per-seat costs usually mean you're on a tier with features your team doesn't need, or you haven't taken advantage of volume pricing. At this cost, it's worth a 10-minute audit of which plan features your team actually uses.`,
    action: downgrade
      ? `Evaluate whether ${downgrade.label} meets your needs — it would bring your cost to $${downgrade.pricePerSeat}/seat/mo.`
      : `Review your ${spec.name} plan features. List which ones your team uses weekly — cancel any tier whose premium features go unused.`,
    monthlySavings: Math.max(0, potential),
    confidence: 'estimate',
    tag: 'High Per-Seat Cost',
  }
}

// ─── Rule: Windsurf as cheaper Cursor alternative ─────────────────────────────

/**
 * Cursor users may not know Windsurf is $5/seat cheaper.
 */
export function ruleWindsurfVsCursor(allTools, context) {
  const cursor = allTools.find(t => t.toolId === 'cursor')
  const windsurf = allTools.find(t => t.toolId === 'windsurf')

  // Only flag if they have Cursor but not Windsurf, and Cursor is on Pro
  if (!cursor || windsurf) return null
  if (cursor.monthlySpend <= 0) return null

  const cursorPlan = resolvePlan('cursor', cursor.plan)
  if (!cursorPlan || cursorPlan.id !== 'pro') return null

  const seats = cursor.seats || 1
  const savings = 5 * seats // Windsurf Pro is $15 vs Cursor Pro $20

  if (savings < 5) return null

  return {
    id: 'windsurf-vs-cursor',
    toolId: 'cursor',
    type: 'cheaper-alternative',
    severity: 'low',
    title: 'Windsurf is $5/seat cheaper than Cursor with comparable features',
    description: `Cursor Pro costs $20/seat/mo. Windsurf Pro is $15/seat/mo — same core capabilities (unlimited completions, Claude & GPT-4 access, codebase context).`,
    reasoning: `For teams not locked into Cursor's specific UX, Windsurf offers nearly identical functionality at a 25% lower price point. Both are excellent tools — this is a cost-optimization flag, not a quality judgment. The $5/seat difference adds up to $${(savings * 12).toFixed(0)}/year for your team.`,
    action: `Trial Windsurf Pro (free 2-week trial available) before your next Cursor renewal. If developers are happy, switch and save $${savings}/mo.`,
    monthlySavings: savings,
    confidence: 'exact',
    tag: 'Cheaper Alternative',
    alternativeTool: 'windsurf',
  }
}

// ─── Rule: Gemini Workspace add-on vs. standalone ────────────────────────────

/**
 * If team uses Google Workspace, Gemini Workspace add-on may be cheaper
 * than individual Gemini Advanced subscriptions.
 */
export function ruleGeminiWorkspaceAddOn(toolEntry, context) {
  const { toolId, plan, monthlySpend, seats } = toolEntry
  if (toolId !== 'gemini') return null

  const resolvedPlan = resolvePlan('gemini', plan)
  if (!resolvedPlan || resolvedPlan.id !== 'advanced') return null
  if (!seats || seats < 3) return null

  // Gemini Advanced = $20/seat. Workspace add-on = $30/seat but includes Docs/Sheets/Slides AI.
  // Note: if they're already on Workspace, the add-on is $30 but includes more.
  // This is informational — workspace pricing can be better for Google-heavy teams.
  const workspaceCost = 30 * seats
  const currentCost = monthlySpend

  return {
    id: 'gemini-workspace-addon',
    toolId: 'gemini',
    type: 'pricing-optimization',
    severity: 'info',
    title: 'Consider Gemini for Google Workspace if your team uses Google apps',
    description: `You have ${seats} Gemini Advanced seats at $20/seat. If your team already uses Google Workspace, the Gemini Workspace Add-on ($30/seat) includes AI in Docs, Sheets, Slides, and Meet.`,
    reasoning: `The $10/seat premium for the Workspace add-on pays off if your team writes documents or works with spreadsheets in Google — it's AI built directly into those apps, not just a separate chat window. Conversely, if your team doesn't use Google Workspace, ignore this.`,
    action: `Check if your team already uses Google Workspace. If yes, ask your Google admin about the Gemini Add-on — the integrated experience may justify the $${(workspaceCost - currentCost).toFixed(0)}/mo premium.`,
    monthlySavings: 0, // This may increase spend — it's an opportunity, not pure savings
    confidence: 'rough',
    tag: 'Opportunity',
    isOpportunity: true,
  }
}

// ─── Rule: Positive feedback — tool is well-priced ───────────────────────────

/**
 * When a tool's spend matches expected pricing perfectly, give positive reinforcement.
 */
export function ruleWellPricedTool(toolEntry, context) {
  const { toolId, plan, monthlySpend, seats } = toolEntry
  const spec = TOOL_KNOWLEDGE[toolId]
  if (!spec) return null

  const resolvedPlan = resolvePlan(toolId, plan)
  if (!resolvedPlan || resolvedPlan.isEnterprise) return null

  const expected = computeExpectedCost(resolvedPlan, seats || 1)
  if (expected === 0 || monthlySpend === 0) return null

  const delta = Math.abs(monthlySpend - expected)
  const deltaPercent = (delta / expected) * 100

  if (deltaPercent > 15) return null // Not well-priced enough

  // Only emit this if no other findings for this tool
  return {
    id: `well-priced-${toolId}`,
    toolId,
    type: 'healthy',
    severity: 'info',
    title: `${spec.name} is correctly priced`,
    description: `Your $${monthlySpend}/mo spend on ${spec.name} ${resolvedPlan.label} aligns with published pricing.`,
    reasoning: `No billing anomalies detected. Your plan matches your team's scale.`,
    action: 'No action needed.',
    monthlySavings: 0,
    confidence: 'exact',
    tag: 'Looks Good',
  }
}
