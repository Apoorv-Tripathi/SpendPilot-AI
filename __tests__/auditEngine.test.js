/**
 * auditEngine.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive tests for the SpendLens audit engine.
 * Tests cover: helpers, rules, metrics, verdicts, and end-to-end scenarios.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  teamSizeBucket,
  detectExcessSeats,
  detectOverpayment,
  computeExpectedCost,
  costPerSeat,
  savingsSeverity,
  resolvePlan,
  findRedundancies,
} from '../src/engine/auditHelpers.js'

import { runAudit, groupFindingsByTool } from '../src/engine/auditEngine.js'

// ─── Test helpers ─────────────────────────────────────────────────────────────

/** Build a minimal valid form state for runAudit() */
function makeFormState(overrides = {}) {
  return {
    teamSize: '5',
    primaryUseCase: 'coding',
    tools: [
      {
        id: 'tool_1',
        toolName: 'cursor',
        plan: 'Pro',
        monthlySpend: '20',
        seats: '1',
      },
    ],
    ...overrides,
  }
}

/** Build a single tool entry */
function makeTool(overrides = {}) {
  return {
    id: 'tool_1',
    toolName: 'cursor',
    plan: 'Pro',
    monthlySpend: '20',
    seats: '1',
    ...overrides,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('teamSizeBucket()', () => {
  test('solo: returns "solo" for 1 person', () => {
    expect(teamSizeBucket(1)).toBe('solo')
  })

  test('small: returns "small" for 2–5 people', () => {
    expect(teamSizeBucket(2)).toBe('small')
    expect(teamSizeBucket(5)).toBe('small')
  })

  test('medium: returns "medium" for 6–20 people', () => {
    expect(teamSizeBucket(6)).toBe('medium')
    expect(teamSizeBucket(20)).toBe('medium')
  })

  test('large: returns "large" for 21–100 people', () => {
    expect(teamSizeBucket(21)).toBe('large')
    expect(teamSizeBucket(100)).toBe('large')
  })

  test('enterprise: returns "enterprise" for 101+ people', () => {
    expect(teamSizeBucket(101)).toBe('enterprise')
    expect(teamSizeBucket(10000)).toBe('enterprise')
  })
})

describe('detectExcessSeats()', () => {
  test('returns no excess when seats equal team size', () => {
    const result = detectExcessSeats(5, 5)
    expect(result.hasExcessSeats).toBe(false)
    expect(result.excessSeats).toBe(0)
  })

  test('returns excess when seats exceed team size', () => {
    const result = detectExcessSeats(10, 7)
    expect(result.hasExcessSeats).toBe(true)
    expect(result.excessSeats).toBe(3)
  })

  test('returns no excess when seats are less than team size', () => {
    const result = detectExcessSeats(3, 10)
    expect(result.hasExcessSeats).toBe(false)
    expect(result.excessSeats).toBe(0)
  })
})

describe('detectOverpayment()', () => {
  test('returns not overpaying when actual equals expected', () => {
    const result = detectOverpayment(100, 100)
    expect(result.isOverpaying).toBe(false)
    expect(result.delta).toBe(0)
  })

  test('flags overpayment when actual is >20% above expected', () => {
    const result = detectOverpayment(130, 100)
    expect(result.isOverpaying).toBe(true)
    expect(result.delta).toBe(30)
    expect(result.deltaPercent).toBeCloseTo(30)
  })

  test('does NOT flag overpayment for small variance (taxes, etc.)', () => {
    const result = detectOverpayment(115, 100) // 15% over — within tolerance
    expect(result.isOverpaying).toBe(false)
  })

  test('returns zero delta when expectedCost is 0', () => {
    const result = detectOverpayment(500, 0)
    expect(result.isOverpaying).toBe(false)
    expect(result.delta).toBe(0)
  })
})

describe('computeExpectedCost()', () => {
  test('returns 0 for enterprise plans with no price', () => {
    const plan = { isEnterprise: true, pricePerSeat: null, minSeats: 50 }
    expect(computeExpectedCost(plan, 10)).toBe(0)
  })

  test('returns 0 for null plan', () => {
    expect(computeExpectedCost(null, 5)).toBe(0)
  })

  test('computes correct cost for paid plan', () => {
    const plan = { pricePerSeat: 20, minSeats: 1, isEnterprise: false }
    expect(computeExpectedCost(plan, 5)).toBe(100)
  })

  test('respects minimum seats', () => {
    const plan = { pricePerSeat: 30, minSeats: 2, isEnterprise: false }
    // Even if seats=1, minSeats=2 should be used
    expect(computeExpectedCost(plan, 1)).toBe(60)
  })
})

describe('costPerSeat()', () => {
  test('divides spend evenly across seats', () => {
    expect(costPerSeat(100, 5)).toBe(20)
  })

  test('returns total spend when seats is 0', () => {
    expect(costPerSeat(100, 0)).toBe(100)
  })

  test('handles single seat', () => {
    expect(costPerSeat(20, 1)).toBe(20)
  })
})

describe('savingsSeverity()', () => {
  test('critical for savings >= $500/mo', () => {
    expect(savingsSeverity(500)).toBe('critical')
    expect(savingsSeverity(1000)).toBe('critical')
  })

  test('high for savings $200–$499/mo', () => {
    expect(savingsSeverity(200)).toBe('high')
    expect(savingsSeverity(499)).toBe('high')
  })

  test('medium for savings $50–$199/mo', () => {
    expect(savingsSeverity(50)).toBe('medium')
    expect(savingsSeverity(199)).toBe('medium')
  })

  test('low for savings $1–$49/mo', () => {
    expect(savingsSeverity(1)).toBe('low')
    expect(savingsSeverity(49)).toBe('low')
  })

  test('info for zero savings', () => {
    expect(savingsSeverity(0)).toBe('info')
  })
})

describe('resolvePlan()', () => {
  test('resolves "Pro" for cursor', () => {
    const plan = resolvePlan('cursor', 'Pro')
    expect(plan).not.toBeNull()
    expect(plan.id).toBe('pro')
    expect(plan.pricePerSeat).toBe(20)
  })

  test('resolves "Business" for cursor', () => {
    const plan = resolvePlan('cursor', 'Business')
    expect(plan).not.toBeNull()
    expect(plan.id).toBe('business')
    expect(plan.pricePerSeat).toBe(40)
  })

  test('returns null for unknown tool', () => {
    const plan = resolvePlan('unknown-tool', 'Pro')
    expect(plan).toBeNull()
  })

  test('returns null for empty plan label', () => {
    const plan = resolvePlan('cursor', '')
    expect(plan).toBeNull()
  })

  test('resolves case-insensitively', () => {
    const plan = resolvePlan('cursor', 'pro ($20/mo)')
    expect(plan).not.toBeNull()
    expect(plan.id).toBe('pro')
  })
})

describe('findRedundancies()', () => {
  test('detects coding assistant redundancy', () => {
    const result = findRedundancies(['cursor', 'github-copilot'])
    expect(result.length).toBe(1)
    expect(result[0].group.id).toBe('coding-assistants')
    expect(result[0].overlappingTools).toContain('cursor')
    expect(result[0].overlappingTools).toContain('github-copilot')
  })

  test('detects chat assistant redundancy', () => {
    const result = findRedundancies(['claude', 'chatgpt'])
    expect(result.length).toBe(1)
    expect(result[0].group.id).toBe('chat-assistants')
  })

  test('returns empty array when no redundancies', () => {
    const result = findRedundancies(['cursor', 'claude'])
    expect(result.length).toBe(0)
  })

  test('detects multiple redundancy groups simultaneously', () => {
    const result = findRedundancies(['cursor', 'github-copilot', 'claude', 'chatgpt'])
    expect(result.length).toBe(2)
  })

  test('does not flag single tool in a group', () => {
    const result = findRedundancies(['cursor'])
    expect(result.length).toBe(0)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. AUDIT ENGINE — FULL REPORT
// ═══════════════════════════════════════════════════════════════════════════════

describe('runAudit() — basic structure', () => {
  test('returns required report shape', () => {
    const report = runAudit(makeFormState())
    expect(report).toHaveProperty('context')
    expect(report).toHaveProperty('tools')
    expect(report).toHaveProperty('findings')
    expect(report).toHaveProperty('metrics')
    expect(report).toHaveProperty('verdict')
    expect(report).toHaveProperty('generatedAt')
  })

  test('normalises teamSize to number', () => {
    const report = runAudit(makeFormState({ teamSize: '12' }))
    expect(report.context.teamSize).toBe(12)
  })

  test('filters out empty tool rows', () => {
    const formState = makeFormState({
      tools: [
        makeTool({ toolName: 'cursor', monthlySpend: '20' }),
        makeTool({ id: 'tool_2', toolName: '', monthlySpend: '0' }), // empty
      ],
    })
    const report = runAudit(formState)
    expect(report.tools.length).toBe(1)
  })

  test('handles empty tools array gracefully', () => {
    const report = runAudit(makeFormState({ tools: [] }))
    expect(report.metrics.totalMonthlySpend).toBe(0)
    expect(report.findings).toEqual([])
  })

  test('generatedAt is a Date', () => {
    const report = runAudit(makeFormState())
    expect(report.generatedAt).toBeInstanceOf(Date)
  })
})

describe('runAudit() — metrics calculations', () => {
  test('calculates totalMonthlySpend correctly', () => {
    const formState = makeFormState({
      tools: [
        makeTool({ toolName: 'cursor',  monthlySpend: '20', seats: '1' }),
        makeTool({ id: 'tool_2', toolName: 'chatgpt', monthlySpend: '30', seats: '1' }),
      ],
    })
    const report = runAudit(formState)
    expect(report.metrics.totalMonthlySpend).toBe(50)
  })

  test('calculates totalAnnualSpend as 12x monthly', () => {
    const report = runAudit(makeFormState({
      tools: [makeTool({ monthlySpend: '100' })],
    }))
    expect(report.metrics.totalAnnualSpend).toBe(1200)
  })

  test('calculates perEmployeeCost correctly', () => {
    const report = runAudit(makeFormState({
      teamSize: '10',
      tools: [makeTool({ monthlySpend: '200' })],
    }))
    expect(report.metrics.perEmployeeCost).toBe(20)
  })

  test('caps savings at 80% of total spend', () => {
    // Give it lots of overlapping tools so raw savings would exceed spend
    const formState = makeFormState({
      teamSize: '2',
      tools: [
        makeTool({ toolName: 'cursor',        monthlySpend: '40',  seats: '2' }),
        makeTool({ id: 't2', toolName: 'github-copilot', monthlySpend: '38',  seats: '2' }),
        makeTool({ id: 't3', toolName: 'windsurf',       monthlySpend: '30',  seats: '2' }),
        makeTool({ id: 't4', toolName: 'claude',         monthlySpend: '30',  seats: '2' }),
        makeTool({ id: 't5', toolName: 'chatgpt',        monthlySpend: '30',  seats: '2' }),
      ],
    })
    const report = runAudit(formState)
    const maxSavings = report.metrics.totalMonthlySpend * 0.8
    expect(report.metrics.potentialMonthlySavings).toBeLessThanOrEqual(maxSavings)
  })

  test('wasteScore is between 0 and 100', () => {
    const report = runAudit(makeFormState())
    expect(report.metrics.wasteScore).toBeGreaterThanOrEqual(0)
    expect(report.metrics.wasteScore).toBeLessThanOrEqual(100)
  })

  test('healthy single tool gets high waste score', () => {
    const report = runAudit(makeFormState({
      teamSize: '3',
      tools: [makeTool({ toolName: 'cursor', plan: 'Pro', monthlySpend: '60', seats: '3' })],
    }))
    expect(report.metrics.wasteScore).toBeGreaterThan(60)
  })
})

describe('runAudit() — verdict generation', () => {
  test('returns "good" mood for $0 spend', () => {
    const report = runAudit(makeFormState({
      tools: [makeTool({ monthlySpend: '0' })],
    }))
    expect(report.verdict.mood).toBe('good')
    expect(report.verdict.headline).toContain('No spend data')
  })

  test('verdict has headline and subtext strings', () => {
    const report = runAudit(makeFormState())
    expect(typeof report.verdict.headline).toBe('string')
    expect(typeof report.verdict.subtext).toBe('string')
    expect(report.verdict.headline.length).toBeGreaterThan(0)
  })

  test('returns "critical" mood for very wasteful stack', () => {
    // Three overlapping coding tools + three overlapping chat tools = many critical findings
    const formState = makeFormState({
      teamSize: '3',
      tools: [
        makeTool({ toolName: 'cursor',        plan: 'Business', monthlySpend: '120', seats: '3' }),
        makeTool({ id: 't2', toolName: 'github-copilot', plan: 'Enterprise', monthlySpend: '117', seats: '3' }),
        makeTool({ id: 't3', toolName: 'windsurf',       plan: 'Teams',    monthlySpend: '90',  seats: '3' }),
        makeTool({ id: 't4', toolName: 'claude',         plan: 'Team',     monthlySpend: '90',  seats: '3' }),
        makeTool({ id: 't5', toolName: 'chatgpt',        plan: 'Team',     monthlySpend: '90',  seats: '3' }),
      ],
    })
    const report = runAudit(formState)
    expect(['concerning', 'critical']).toContain(report.verdict.mood)
  })
})

describe('runAudit() — finding rules', () => {
  test('flags redundant coding assistants', () => {
    const formState = makeFormState({
      tools: [
        makeTool({ toolName: 'cursor',        monthlySpend: '20' }),
        makeTool({ id: 't2', toolName: 'github-copilot', monthlySpend: '10' }),
      ],
    })
    const report = runAudit(formState)
    const redundancyFinding = report.findings.find(f => f.type === 'redundancy')
    expect(redundancyFinding).toBeDefined()
    expect(redundancyFinding.monthlySavings).toBeGreaterThan(0)
  })

  test('flags redundant chat assistants', () => {
    const formState = makeFormState({
      primaryUseCase: 'writing',
      tools: [
        makeTool({ toolName: 'claude',  monthlySpend: '20' }),
        makeTool({ id: 't2', toolName: 'chatgpt', monthlySpend: '20' }),
        makeTool({ id: 't3', toolName: 'gemini',  monthlySpend: '20' }),
      ],
    })
    const report = runAudit(formState)
    const chatRedundancy = report.findings.find(
      f => f.type === 'redundancy' && f.id === 'redundant-chat-assistants'
    )
    expect(chatRedundancy).toBeDefined()
  })

  test('flags excess seats', () => {
    const formState = makeFormState({
      teamSize: '3',
      tools: [makeTool({ toolName: 'cursor', plan: 'Pro', monthlySpend: '200', seats: '10' })],
    })
    const report = runAudit(formState)
    const excessFinding = report.findings.find(f => f.type === 'excess-seats')
    expect(excessFinding).toBeDefined()
    expect(excessFinding.monthlySavings).toBeGreaterThan(0)
  })


  test('flags business plan on solo user', () => {
    const formState = makeFormState({
      teamSize: '1',
      tools: [makeTool({ toolName: 'cursor', plan: 'Business', monthlySpend: '40', seats: '1' })],
    })
    const report = runAudit(formState)
    const wrongPlan = report.findings.find(f => f.type === 'wrong-plan')
    expect(wrongPlan).toBeDefined()
  })
  test('does not flag excess seats when seats equal team size', () => {
    const formState = makeFormState({
      teamSize: '5',
      tools: [makeTool({ toolName: 'cursor', plan: 'Pro', monthlySpend: '100', seats: '5' })],
    })
    const report = runAudit(formState)
    const excessFinding = report.findings.find(f => f.type === 'excess-seats')
    expect(excessFinding).toBeUndefined()
  })

  test('findings are sorted by severity (critical first)', () => {
    const formState = makeFormState({
      teamSize: '2',
      tools: [
        makeTool({ toolName: 'cursor',        monthlySpend: '40',  seats: '2' }),
        makeTool({ id: 't2', toolName: 'github-copilot', monthlySpend: '500', seats: '2' }),
      ],
    })
    const report = runAudit(formState)
    const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
    for (let i = 0; i < report.findings.length - 1; i++) {
      const curr = SEVERITY_ORDER[report.findings[i].severity] ?? 4
      const next = SEVERITY_ORDER[report.findings[i + 1].severity] ?? 4
      expect(curr).toBeLessThanOrEqual(next)
    }
  })

  test('no duplicate finding IDs in report', () => {
    const formState = makeFormState({
      teamSize: '5',
      tools: [
        makeTool({ toolName: 'cursor',        monthlySpend: '100', seats: '5' }),
        makeTool({ id: 't2', toolName: 'github-copilot', monthlySpend: '95',  seats: '5' }),
        makeTool({ id: 't3', toolName: 'claude',         monthlySpend: '150', seats: '5' }),
        makeTool({ id: 't4', toolName: 'chatgpt',        monthlySpend: '150', seats: '5' }),
      ],
    })
    const report = runAudit(formState)
    const ids = report.findings.map(f => f.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. groupFindingsByTool()
// ═══════════════════════════════════════════════════════════════════════════════

describe('groupFindingsByTool()', () => {
  test('returns a Map', () => {
    const result = groupFindingsByTool([], [])
    expect(result).toBeInstanceOf(Map)
  })

  test('initialises every tool with an empty array', () => {
    const tools = [
      { toolId: 'cursor', id: 't1' },
      { toolId: 'claude', id: 't2' },
    ]
    const result = groupFindingsByTool([], tools)
    expect(result.get('cursor')).toEqual([])
    expect(result.get('claude')).toEqual([])
  })

  test('routes per-tool findings to correct tool', () => {
    const tools = [{ toolId: 'cursor', id: 't1' }]
    const findings = [
      { id: 'f1', toolId: 'cursor', type: 'excess-seats', monthlySavings: 40 },
    ]
    const result = groupFindingsByTool(findings, tools)
    expect(result.get('cursor').length).toBe(1)
    expect(result.get('cursor')[0].id).toBe('f1')
  })

  test('routes global findings to global bucket', () => {
    const tools = [{ toolId: 'cursor', id: 't1' }]
    const findings = [
      { id: 'f1', toolId: 'global', type: 'redundancy', affectedTools: ['cursor', 'github-copilot'], monthlySavings: 10 },
    ]
    const result = groupFindingsByTool(findings, tools)
    expect(result.get('global').length).toBe(1)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 4. END-TO-END SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

describe('End-to-end: well-optimised team', () => {
  const formState = {
    teamSize: '5',
    primaryUseCase: 'coding',
    tools: [
      { id: 't1', toolName: 'cursor', plan: 'Pro', monthlySpend: '100', seats: '5' },
    ],
  }

  test('produces a report without critical findings', () => {
    const report = runAudit(formState)
    const criticalFindings = report.findings.filter(f => f.severity === 'critical')
    expect(criticalFindings.length).toBe(0)
  })

  test('wasteScore is 70 or above', () => {
    const report = runAudit(formState)
    expect(report.metrics.wasteScore).toBeGreaterThanOrEqual(70)
  })
})

describe('End-to-end: maximally wasteful team', () => {
  const formState = {
    teamSize: '3',
    primaryUseCase: 'mixed',
    tools: [
      { id: 't1', toolName: 'cursor',        plan: 'Enterprise', monthlySpend: '600', seats: '15' },
      { id: 't2', toolName: 'github-copilot',plan: 'Enterprise', monthlySpend: '585', seats: '15' },
      { id: 't3', toolName: 'windsurf',      plan: 'Teams',      monthlySpend: '450', seats: '15' },
      { id: 't4', toolName: 'claude',        plan: 'Team',       monthlySpend: '450', seats: '15' },
      { id: 't5', toolName: 'chatgpt',       plan: 'Team',       monthlySpend: '450', seats: '15' },
    ],
  }

  test('finds at least 3 findings', () => {
    const report = runAudit(formState)
    expect(report.findings.filter(f => f.type !== 'healthy').length).toBeGreaterThanOrEqual(3)
  })

  test('potential savings are greater than $200/mo', () => {
    const report = runAudit(formState)
    expect(report.metrics.potentialMonthlySavings).toBeGreaterThan(200)
  })

  test('verdict mood is concerning or critical', () => {
    const report = runAudit(formState)
    expect(['concerning', 'critical']).toContain(report.verdict.mood)
  })

  test('all findings have required fields', () => {
    const report = runAudit(formState)
    for (const finding of report.findings) {
      expect(finding).toHaveProperty('id')
      expect(finding).toHaveProperty('toolId')
      expect(finding).toHaveProperty('type')
      expect(finding).toHaveProperty('severity')
      expect(finding).toHaveProperty('title')
      expect(finding).toHaveProperty('description')
      expect(finding).toHaveProperty('reasoning')
      expect(finding).toHaveProperty('action')
      expect(finding).toHaveProperty('monthlySavings')
    }
  })
})
