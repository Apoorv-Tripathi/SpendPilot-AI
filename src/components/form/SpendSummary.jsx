import { TrendingUp, Users, Package, DollarSign } from 'lucide-react'
import { formatCurrency } from '../../utils'
import { AI_TOOLS } from '../../constants'

export default function SpendSummary({ tools, teamSize, totals }) {
  const filledTools = tools.filter(t => t.toolName && t.monthlySpend)

  return (
    <div className="card-glass border border-white/[0.08] rounded-2xl p-6 sticky top-24">
      <h3 className="font-display font-bold text-sm uppercase tracking-widest text-white/50 mb-5">
        Live Summary
      </h3>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: DollarSign, label: 'Monthly Total', value: formatCurrency(totals.totalMonthlySpend), accent: 'text-acid' },
          { icon: TrendingUp, label: 'Annual Spend', value: formatCurrency(totals.totalMonthlySpend * 12), accent: 'text-white' },
          { icon: Package, label: 'Tools Logged', value: `${totals.toolCount}`, accent: 'text-purple-400' },
          { icon: Users, label: 'Total Seats', value: totals.totalSeats || '—', accent: 'text-blue-400' },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className="bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.06]">
            <Icon size={13} className="text-white/30 mb-2" />
            <div className={`font-display font-bold text-lg ${accent}`}>{value}</div>
            <div className="font-body text-xs text-white/30 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Per-seat breakdown */}
      {teamSize && totals.totalMonthlySpend > 0 && (
        <div className="bg-acid/5 border border-acid/15 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-acid" />
            <span className="font-mono text-xs text-acid/70 uppercase tracking-wider">Per employee</span>
          </div>
          <div className="font-display font-bold text-2xl text-acid">
            {formatCurrency(totals.totalMonthlySpend / parseInt(teamSize))}
            <span className="text-acid/50 font-normal text-sm">/mo</span>
          </div>
          <div className="font-body text-xs text-white/30 mt-1">
            Based on {teamSize} team members
          </div>
        </div>
      )}

      {/* Tool breakdown list */}
      {filledTools.length > 0 && (
        <div className="space-y-2">
          <div className="text-white/30 font-body text-xs uppercase tracking-widest mb-3">Breakdown</div>
          {filledTools.map(tool => {
            const meta = AI_TOOLS.find(t => t.id === tool.toolName)
            const spend = parseFloat(tool.monthlySpend) || 0
            const pct = totals.totalMonthlySpend > 0
              ? (spend / totals.totalMonthlySpend) * 100
              : 0

            return (
              <div key={tool.id} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: meta?.color || '#ffffff20' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-body text-xs text-white/60 truncate">
                      {meta?.name || tool.toolName}
                    </span>
                    <span className="font-mono text-xs text-white/60 flex-shrink-0">
                      {formatCurrency(spend)}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: meta?.color || '#C8F135',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filledTools.length === 0 && (
        <div className="text-center py-6">
          <div className="text-white/15 font-body text-xs">
            Add tools above to see<br />your spend breakdown
          </div>
        </div>
      )}
    </div>
  )
}
