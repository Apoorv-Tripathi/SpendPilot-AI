import { formatCurrency } from '../../utils'
import { TOOL_KNOWLEDGE } from '../../engine/auditKnowledge.js'

const TYPE_LABELS = {
  redundancy:           'Redundant tools',
  'wrong-plan':         'Wrong plan tier',
  'excess-seats':       'Unused seats',
  'billing-anomaly':    'Billing anomaly',
  'pricing-optimization':'Pricing discount',
  'cheaper-alternative':'Cheaper alternative',
  'misaligned-tool':    'Misaligned tool',
  'cost-per-seat':      'High seat cost',
  'api-overlap':        'API overlap',
}

export default function SavingsBreakdown({ findings, metrics }) {
  const savingsFindings = findings.filter(f => f.monthlySavings > 0 && !f.isOpportunity && f.type !== 'healthy')

  if (savingsFindings.length === 0) {
    return (
      <div className="card-glass border border-white/[0.06] rounded-2xl p-8 text-center">
        <div className="text-white/20 font-body text-sm">No quantifiable savings found in this audit.</div>
      </div>
    )
  }

  // Group by finding type
  const byType = {}
  for (const f of savingsFindings) {
    byType[f.type] = (byType[f.type] || 0) + f.monthlySavings
  }

  const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1])
  const max = sorted[0]?.[1] ?? 1

  // Group by tool for the donut
  const byTool = {}
  for (const f of savingsFindings) {
    const key = f.toolId === 'global' && f.affectedTools
      ? f.affectedTools[0]
      : f.toolId
    byTool[key] = (byTool[key] || 0) + f.monthlySavings
  }

  return (
    <div className="card-glass border border-white/[0.08] rounded-2xl p-6">
      <h3 className="font-display font-bold text-base text-white mb-6">Savings Breakdown</h3>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-acid/5 border border-acid/15 rounded-xl p-4">
          <div className="font-mono text-xs text-acid/60 uppercase tracking-widest mb-1">Monthly savings</div>
          <div className="font-display font-extrabold" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)', color: '#58A6FF' }}>
            {formatCurrency(metrics.potentialMonthlySavings)}
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="font-mono text-xs text-white/30 uppercase tracking-widest mb-1">Annual savings</div>
          <div className="font-display font-extrabold" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.875rem)', color: '#E6EDF3' }}>
            {formatCurrency(metrics.potentialAnnualSavings)}
          </div>
        </div>
      </div>

      {/* By category bars */}
      <div className="space-y-3 mb-8">
        <div className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">By category</div>
        {sorted.map(([type, amount]) => {
          const pct = (amount / max) * 100
          return (
            <div key={type} className="flex items-center gap-3">
              <div className="w-36 font-body text-xs text-white/50 text-right flex-shrink-0">
                {TYPE_LABELS[type] ?? type}
              </div>
              <div className="flex-1 h-6 bg-white/[0.04] rounded-lg overflow-hidden">
                <div
                  className="h-full bg-acid rounded-lg flex items-center px-2 transition-all duration-700"
                  style={{ width: `${pct}%`, minWidth: '2rem' }}
                >
                  <span className="font-mono text-ink text-xs font-medium whitespace-nowrap">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* By tool mini breakdown */}
      {Object.keys(byTool).length > 1 && (
        <div>
          <div className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">By tool</div>
          <div className="space-y-2">
            {Object.entries(byTool)
              .sort((a, b) => b[1] - a[1])
              .map(([toolId, amount]) => {
                const spec = TOOL_KNOWLEDGE[toolId]
                const pct = metrics.potentialMonthlySavings > 0
                  ? (amount / metrics.potentialMonthlySavings) * 100
                  : 0
                return (
                  <div key={toolId} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                      style={{ background: `${spec?.color ?? '#888'}20`, color: spec?.color ?? '#888' }}>
                      {spec?.icon ?? '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-body text-xs text-white/50">{spec?.name ?? toolId}</span>
                        <span className="font-mono text-xs text-white/40">{formatCurrency(amount)}/mo</span>
                      </div>
                      <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: spec?.color ?? '#C8F135' }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Confidence note */}
      <p className="mt-6 font-body text-xs text-white/20 leading-relaxed border-t border-white/[0.05] pt-4">
        Savings estimates are based on published list pricing. Actual savings depend on your contract terms, regional taxes, and negotiated rates. Estimates marked "rough" have higher uncertainty.
      </p>
    </div>
  )
}
