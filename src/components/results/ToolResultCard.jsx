import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { TOOL_KNOWLEDGE } from '../../engine/auditKnowledge.js'
import { formatCurrency } from '../../utils'
import FindingCard from './FindingCard'

export default function ToolResultCard({ toolEntry, findings }) {
  const [open, setOpen] = useState(true)
  const spec = TOOL_KNOWLEDGE[toolEntry.toolId]
  if (!spec) return null

  const realFindings = findings.filter(f => f.type !== 'healthy')
  const isHealthy    = realFindings.length === 0
  const savings      = realFindings.reduce((s, f) => s + (f.monthlySavings || 0), 0)

  return (
    <div className="card-glass border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Tool header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        {/* Tool icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold"
          style={{
            background: `${spec.color}18`,
            color: spec.color,
            border: `1px solid ${spec.color}30`,
          }}
        >
          {spec.icon}
        </div>

        {/* Name + spend */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-display font-bold text-base text-white">{spec.name}</span>
            {isHealthy ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono text-xs text-emerald-400">
                ✓ Looks good
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 font-mono text-xs text-orange-400">
                {realFindings.length} {realFindings.length === 1 ? 'finding' : 'findings'}
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-white/30 mt-0.5">
            {formatCurrency(toolEntry.monthlySpend)}/mo
            {toolEntry.seats > 1 && (
              <span className="ml-2">
                · {toolEntry.seats} seats
                · {formatCurrency(toolEntry.monthlySpend / toolEntry.seats)}/seat
              </span>
            )}
            {toolEntry.plan && <span className="ml-2">· {toolEntry.plan}</span>}
          </div>
        </div>

        {/* Savings badge */}
        {savings > 0 && (
          <div className="text-right flex-shrink-0">
            <div className="font-display font-bold text-base text-acid">
              -{formatCurrency(savings)}/mo
            </div>
            <div className="font-mono text-xs text-white/25">potential</div>
          </div>
        )}

        <div className="text-white/25 flex-shrink-0">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Findings */}
      {open && findings.length > 0 && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.05]">
          <div className="pt-3 space-y-3">
            {findings.map((finding, i) => (
              <FindingCard key={finding.id} finding={finding} index={i} />
            ))}
          </div>
        </div>
      )}

      {open && findings.length === 0 && (
        <div className="px-6 pb-5 border-t border-white/[0.05]">
          <p className="pt-4 font-body text-sm text-white/30 text-center">
            No issues found for this tool.
          </p>
        </div>
      )}
    </div>
  )
}
