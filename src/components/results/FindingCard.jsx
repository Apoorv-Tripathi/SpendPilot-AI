import { useState } from 'react'
import { ChevronDown, ChevronUp, ArrowRight, AlertTriangle, AlertCircle, Info, XCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '../../utils'

const STYLES = {
  critical:  { icon: XCircle,       color: '#F85149', bg: 'rgba(248,81,73,0.05)',   border: 'rgba(248,81,73,0.18)'  },
  high:      { icon: AlertTriangle,  color: '#F0883E', bg: 'rgba(240,136,62,0.05)',  border: 'rgba(240,136,62,0.18)' },
  medium:    { icon: AlertCircle,    color: '#D29922', bg: 'rgba(210,153,34,0.05)',  border: 'rgba(210,153,34,0.15)' },
  low:       { icon: AlertCircle,    color: '#8B949E', bg: 'rgba(139,148,158,0.04)', border: '#30363D'               },
  info:      { icon: Info,           color: '#58A6FF', bg: 'rgba(88,166,255,0.04)',  border: 'rgba(88,166,255,0.15)' },
}
const HEALTHY = { icon: CheckCircle, color: '#2DD4BF', bg: 'rgba(45,212,191,0.04)', border: 'rgba(45,212,191,0.15)' }

export default function FindingCard({ finding, index }) {
  const [expanded, setExpanded] = useState(finding.severity === 'critical' || finding.severity === 'high')
  const isHealthy = finding.type === 'healthy'
  const s = isHealthy ? HEALTHY : (STYLES[finding.severity] ?? STYLES.info)
  const Icon = s.icon
  const hasSavings = finding.monthlySavings > 0 && !finding.isOpportunity

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}>

      {/* Header */}
      <button onClick={() => setExpanded(e => !e)}
        className="w-full text-left px-5 py-4 flex items-start gap-4">
        <Icon size={16} style={{ color: s.color, flexShrink: 0, marginTop: '2px' }} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-full font-mono text-xs font-medium"
              style={{ background: `${s.color}14`, color: s.color, border: `1px solid ${s.color}25` }}>
              {finding.tag}
            </span>
            {hasSavings && (
              <span className="font-mono text-xs font-semibold" style={{ color: s.color }}>
                Save {formatCurrency(finding.monthlySavings)}/mo
              </span>
            )}
          </div>
          <h3 className="font-display font-semibold text-sm" style={{ color: '#E6EDF3', lineHeight: '1.4' }}>
            {finding.title}
          </h3>
          {!expanded && (
            <p className="font-body text-xs mt-1 truncate" style={{ color: '#484F58' }}>
              {finding.description}
            </p>
          )}
        </div>

        <div style={{ color: '#484F58', flexShrink: 0, marginTop: '2px' }}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4" style={{ borderTop: `1px solid ${s.border}` }}>
          <p className="font-body text-sm leading-relaxed pt-4" style={{ color: '#8B949E' }}>
            {finding.description}
          </p>

          {/* Why this matters */}
          <div className="rounded-xl p-4" style={{ background: 'rgba(13,17,23,0.6)', border: '1px solid #21262D' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-3 rounded-full" style={{ background: '#30363D' }} />
              <span className="font-mono text-xs font-medium uppercase tracking-widest" style={{ color: '#484F58' }}>
                Why this matters
              </span>
            </div>
            <p className="font-body text-sm leading-relaxed" style={{ color: '#8B949E' }}>
              {finding.reasoning}
            </p>
          </div>

          {/* Action */}
          <div className="rounded-xl p-4" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
            <div className="font-mono text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#484F58' }}>
              Recommended action
            </div>
            <p className="font-body text-sm leading-relaxed flex items-start gap-2" style={{ color: s.color }}>
              <ArrowRight size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
              {finding.action}
            </p>
          </div>

          {/* Savings footer */}
          {hasSavings && (
            <div className="flex flex-wrap items-center gap-6 pt-1">
              <div>
                <div className="font-mono text-xs mb-0.5" style={{ color: '#484F58' }}>Monthly savings</div>
                <div className="font-display font-bold text-xl" style={{ color: s.color }}>
                  {formatCurrency(finding.monthlySavings)}
                </div>
              </div>
              <div>
                <div className="font-mono text-xs mb-0.5" style={{ color: '#484F58' }}>Annual savings</div>
                <div className="font-display font-bold text-xl" style={{ color: '#8B949E' }}>
                  {formatCurrency(finding.monthlySavings * 12)}
                </div>
              </div>
              <div className="ml-auto">
                <span className="font-mono text-xs" style={{ color: '#484F58' }}>
                  Confidence: {finding.confidence}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
