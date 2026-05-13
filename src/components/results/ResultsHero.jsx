import { formatCurrency } from '../../utils'
import { TrendingDown, Clock, Layers, DollarSign, CheckCircle, AlertCircle, AlertTriangle, XCircle } from 'lucide-react'

const MOOD = {
  excellent: { icon: CheckCircle,   color: '#2DD4BF', label: 'Optimised',     bg: 'rgba(45,212,191,0.08)',  border: 'rgba(45,212,191,0.20)' },
  good:      { icon: AlertCircle,   color: '#58A6FF', label: 'Savings Found', bg: 'rgba(88,166,255,0.08)',  border: 'rgba(88,166,255,0.20)' },
  concerning:{ icon: AlertTriangle, color: '#F0883E', label: 'Action Needed', bg: 'rgba(240,136,62,0.08)',  border: 'rgba(240,136,62,0.20)' },
  critical:  { icon: XCircle,       color: '#F85149', label: 'Critical Waste',bg: 'rgba(248,81,73,0.08)',   border: 'rgba(248,81,73,0.20)' },
}

export default function ResultsHero({ metrics, verdict, context, generatedAt }) {
  const mood    = MOOD[verdict.mood] ?? MOOD.good
  const MoodIcon = mood.icon

  const stats = [
    { icon: TrendingDown, label: 'Annual savings potential',  value: formatCurrency(metrics.potentialAnnualSavings), highlight: true },
    { icon: Layers,       label: 'Current monthly spend',    value: formatCurrency(metrics.totalMonthlySpend) },
    { icon: Clock,        label: 'Per employee / month',     value: formatCurrency(metrics.perEmployeeCost) },
  ]

  return (
    <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top, ${mood.color}08 0%, transparent 65%)` }} />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-medium"
            style={{ background: mood.bg, border: `1px solid ${mood.border}`, color: mood.color }}>
            <MoodIcon size={12} />
            Audit Report · {mood.label}
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-4">
          <h1 className="font-display font-extrabold tracking-tight"
            >
            {verdict.headline}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto font-body text-base leading-relaxed" style={{ color: '#8B949E' }}>
            {verdict.subtext}
          </p>
        </div>

        {/* Score ring */}
        <div className="flex justify-center my-10">
          <ScoreRing score={metrics.wasteScore} color={mood.color} />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 w-full">
          {stats.map(({ icon: Icon, label, value, highlight }) => (
            <div key={label} className="rounded-2xl p-6 transition-all"
              style={{
                background: highlight ? 'rgba(88,166,255,0.06)' : 'rgba(22,27,34,0.8)',
                border: `1px solid ${highlight ? 'rgba(88,166,255,0.20)' : '#21262D'}`,
              }}>
              <Icon size={15} style={{ color: highlight ? '#58A6FF' : '#484F58', marginBottom: '10px' }} />
              <div className="font-display font-extrabold mb-1" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}
                style={{ color: highlight ? '#58A6FF' : '#E6EDF3' }}>
                {value}
              </div>
              <div className="font-body text-xs" style={{ color: '#8B949E' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Finding counts */}
        {metrics.totalFindings > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-5 mt-7">
            {metrics.criticalCount > 0 && <Pill label={`${metrics.criticalCount} critical`} color="#F85149" />}
            {metrics.highCount > 0     && <Pill label={`${metrics.highCount} high`}     color="#F0883E" />}
            {metrics.mediumCount > 0   && <Pill label={`${metrics.mediumCount} medium`} color="#D29922" />}
            <span style={{ color: '#30363D', fontSize: '12px' }}>·</span>
            <span className="font-mono text-xs" style={{ color: '#484F58' }}>
              {generatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}

function Pill({ label, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="font-mono text-xs" style={{ color }}>{label}</span>
    </div>
  )
}

function ScoreRing({ score, color }) {
  const r    = 52
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const label = score >= 85 ? 'Healthy' : score >= 65 ? 'Fair' : score >= 40 ? 'Wasteful' : 'Critical'

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#21262D" strokeWidth="7" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)`, transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="text-center z-10">
        <div className="font-display font-extrabold text-2xl" style={{ color: '#E6EDF3', fontSize: 'clamp(1.1rem, 4vw, 1.75rem)' }}>{score}</div>
        <div className="font-mono text-xs" style={{ color: '#8B949E' }}>{label}</div>
      </div>
    </div>
  )
}
