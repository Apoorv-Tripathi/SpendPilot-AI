import { ArrowRight, Download, RotateCcw } from 'lucide-react'
import { formatCurrency } from '../../utils'
import LeadCaptureForm from './LeadCaptureForm'

export default function ResultsCTA({ metrics, onReset, publicId }) {
  const isHighSavings = metrics.potentialMonthlySavings >= 500
  const isLowSavings  = metrics.potentialMonthlySavings < 50 && metrics.totalMonthlySpend > 0

  if (isLowSavings) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto card-glass border border-emerald-500/15 rounded-3xl p-10 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="font-display font-bold text-2xl text-white mb-3">
            Your AI stack is well-optimised
          </h2>
          <p className="font-body text-white/50 text-sm leading-relaxed mb-8">
            We only found {formatCurrency(metrics.potentialMonthlySavings)}/mo in potential savings — that's a healthy sign. Re-run this audit quarterly as your team grows or as tool pricing changes.
          </p>
          <button
            onClick={onReset}
            className="btn-outline text-sm px-8 py-3 inline-flex items-center gap-2"
          >
            <RotateCcw size={14} />
            Run Another Audit
          </button>
          <LeadCaptureForm publicId={publicId} />
        </div>
      </section>
    )
  }

  if (isHighSavings) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto relative card-glass border border-acid/20 rounded-3xl p-10 md:p-14 text-center overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(200,241,53,0.06) 0%, transparent 65%)' }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-acid/10 border border-acid/20 rounded-full font-mono text-xs text-acid mb-6">
              High savings detected
            </div>

            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mb-4 leading-tight">
              You're leaving{' '}
              <span className="text-acid">{formatCurrency(metrics.potentialAnnualSavings)}</span>
              <br />
              on the table every year.
            </h2>

            <p className="font-body text-white/50 text-base max-w-xl mx-auto mb-10 leading-relaxed">
              These findings are based on publicly available pricing. Acting on the top recommendations above could realistically recover{' '}
              <span className="text-white font-medium">{formatCurrency(metrics.potentialMonthlySavings)}/month</span>{' '}
              without reducing your team's AI capabilities.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.print()}
                className="btn-primary text-sm px-8 py-4 w-full sm:w-auto justify-center"
              >
                <Download size={15} />
                Export Report
              </button>
              <button
                onClick={onReset}
                className="btn-outline text-sm px-8 py-4 w-full sm:w-auto justify-center"
              >
                <RotateCcw size={14} />
                Re-run Audit
              </button>
            </div>

            <LeadCaptureForm publicId={publicId} />
          </div>
        </div>
      </section>
    )
  }

  // Medium savings
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="font-display font-bold text-2xl text-white mb-3">
          Start with the highest-impact finding
        </h2>
        <p className="font-body text-white/40 text-sm mb-8">
          Implement the top recommendation above first — it takes under 30 minutes and accounts for the majority of your potential savings.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-primary text-sm px-8 py-3"
          >
            Review findings
            <ArrowRight size={14} />
          </button>
          <button
            onClick={onReset}
            className="btn-ghost text-white/40 hover:text-white text-sm"
          >
            <RotateCcw size={14} />
            New audit
          </button>
        </div>
        <LeadCaptureForm publicId={publicId} />
      </div>
    </section>
  )
}
