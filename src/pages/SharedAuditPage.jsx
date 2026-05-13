import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Zap, Share2, Check } from 'lucide-react'
import SEOMeta from '../components/seo/SEOMeta'
import ResultsHero from '../components/results/ResultsHero'
import GlobalFindingsPanel from '../components/results/GlobalFindingsPanel'
import ToolResultCard from '../components/results/ToolResultCard'
import SavingsBreakdown from '../components/results/SavingsBreakdown'
import AuditLoading from '../components/results/AuditLoading'
import { groupFindingsByTool } from '../engine/auditEngine.js'
import { TOOL_KNOWLEDGE } from '../engine/auditKnowledge.js'
import { api } from '../utils/api.js'
import { formatCurrency } from '../utils/index.js'

export default function SharedAuditPage() {
  const { publicId } = useParams()
  const [audit, setAudit]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    if (!publicId) return
    setLoading(true)
    api.getAudit(publicId)
      .then(data => {
        setAudit(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Audit not found')
        setLoading(false)
      })
  }, [publicId])

  async function handleShare() {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      window.prompt('Copy this link:', url)
    }
  }

  if (loading) return <AuditLoading />

  if (error || !audit) {
    return (
      <>
        <SEOMeta title="Audit Not Found" noIndex />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
              <Zap size={24} className="text-white/20" />
            </div>
            <h1 className="font-display font-bold text-2xl text-white mb-3">
              Audit not found
            </h1>
            <p className="font-body text-white/40 text-sm mb-8">
              This audit link may have expired or the ID is incorrect.
            </p>
            <Link to="/audit" className="btn-primary text-sm px-8 py-3 inline-flex">
              Run your own audit
            </Link>
          </div>
        </div>
      </>
    )
  }

  const { findings, metrics, verdict, context, generatedAt, aiSummary } = audit

  // Build SEO metadata from audit data
  const savings   = formatCurrency(metrics.potentialAnnualSavings)
  const ogTitle   = `AI Spend Audit — ${savings} in potential annual savings`
  const ogDesc    = `A ${context.teamSize}-person ${context.primaryUseCase} team is spending ${formatCurrency(metrics.totalMonthlySpend)}/mo on AI tools. Waste score: ${metrics.wasteScore}/100. ${metrics.totalFindings} finding${metrics.totalFindings !== 1 ? 's' : ''} identified.`

  const globalFindings  = findings.filter(
    f => f.toolId === 'global' && (!f.affectedTools || f.affectedTools.length > 1)
  )
  const activeTools     = findings.length > 0
    ? (audit.tools || []).filter(t => t.monthlySpend > 0 && TOOL_KNOWLEDGE[t.toolId])
    : []
  const globalIds       = new Set(globalFindings.map(f => f.id))
  const perToolFindings = groupFindingsByTool(
    findings.filter(f => !globalIds.has(f.id)),
    activeTools
  )

  const reportDate = new Date(generatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <>
      <SEOMeta
        title={`AI Spend Audit — ${savings} savings found`}
        description={ogDesc}
        ogTitle={ogTitle}
        ogDescription={ogDesc}
        ogType="article"
        canonical={`/shared/${publicId}`}
      />

      <div className="min-h-screen">

        {/* Shared audit banner */}
        <div className="bg-acid/10 border-b border-acid/20 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-acid flex items-center justify-center flex-shrink-0">
                <Zap size={13} className="text-ink fill-ink" />
              </div>
              <p className="font-body text-sm text-white/70">
                Shared AI spend audit report · Generated {reportDate}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-body text-xs text-white/60 hover:text-white hover:border-white/20 transition-all"
              >
                {copied ? <Check size={12} className="text-acid" /> : <Share2 size={12} />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <Link
                to="/audit"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acid text-ink font-body text-xs font-semibold hover:bg-acid-pale transition-all"
              >
                Run your own audit →
              </Link>
            </div>
          </div>
        </div>

        {/* Results hero */}
        <ResultsHero
          metrics={metrics}
          verdict={verdict}
          context={context}
          generatedAt={new Date(generatedAt)}
        />

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

          <div className="flex items-center mb-8 pt-4">
            <Link to="/" className="btn-ghost text-white/40 hover:text-white text-sm flex items-center gap-2">
              <ArrowLeft size={14} />
              SpendLens home
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

            {/* Left: findings */}
            <div className="space-y-6">
              {globalFindings.length > 0 && (
                <section aria-labelledby="cross-tool-heading">
                  <SectionLabel step="01" label="Cross-Tool Issues" count={globalFindings.length} />
                  <GlobalFindingsPanel findings={globalFindings} />
                </section>
              )}

              {activeTools.length > 0 && (
                <section aria-labelledby="per-tool-heading">
                  <SectionLabel
                    step={globalFindings.length > 0 ? '02' : '01'}
                    label="Per-Tool Analysis"
                    count={activeTools.length}
                  />
                  <div className="space-y-4">
                    {activeTools.map(tool => (
                      <ToolResultCard
                        key={tool.id || tool.toolId}
                        toolEntry={tool}
                        findings={perToolFindings.get(tool.toolId) ?? []}
                      />
                    ))}
                  </div>
                </section>
              )}

              {findings.length === 0 && (
                <div className="card-glass border border-white/[0.06] rounded-2xl p-12 text-center">
                  <div className="text-4xl mb-4" role="img" aria-label="Sparkles">✨</div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">No issues found</h3>
                  <p className="font-body text-white/40 text-sm">This team's AI stack is well-optimised.</p>
                </div>
              )}
            </div>

            {/* Right: sidebar */}
            <div className="space-y-6">
              <SavingsBreakdown findings={findings} metrics={metrics} />

              {/* AI summary */}
              {aiSummary?.text && (
                <div className="card-glass border border-acid/15 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-acid" aria-hidden="true" />
                    <span className="font-mono text-xs text-acid/70 uppercase tracking-widest">
                      AI Summary
                    </span>
                  </div>
                  <p className="font-body text-sm text-white/60 leading-relaxed">
                    {aiSummary.text}
                  </p>
                </div>
              )}

              {/* Audit context */}
              <div className="card-glass border border-white/[0.06] rounded-2xl p-5 space-y-4">
                <div className="font-mono text-xs text-white/30 uppercase tracking-widest">Audit context</div>
                {[
                  { label: 'Team size',      value: `${context.teamSize} people` },
                  { label: 'Use case',       value: context.primaryUseCase },
                  { label: 'Tools audited',  value: `${metrics.toolCount}` },
                  { label: 'Total findings', value: `${metrics.totalFindings}` },
                  {
                    label: 'Waste score',
                    value: `${metrics.wasteScore}/100`,
                    color: metrics.wasteScore >= 75 ? 'text-emerald-400'
                      : metrics.wasteScore >= 50 ? 'text-yellow-400' : 'text-red-400',
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="font-body text-xs text-white/40">{label}</span>
                    <span className={`font-mono text-xs font-medium capitalize ${color ?? 'text-white/70'}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Run your own CTA */}
              <div className="card-glass border border-white/[0.06] rounded-2xl p-5 text-center">
                <p className="font-body text-sm text-white/40 mb-4">
                  Want to audit your own AI stack?
                </p>
                <Link to="/audit" className="btn-primary text-sm px-6 py-3 inline-flex justify-center w-full">
                  Start Free Audit
                  <Zap size={14} className="fill-ink" />
                </Link>
                <p className="font-body text-xs text-white/20 mt-3">
                  Free · No account required · Results in 14 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function SectionLabel({ step, label, count }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center" aria-hidden="true">
        <span className="font-mono text-acid text-xs">{step}</span>
      </div>
      <h2 className="font-display font-bold text-base text-white">{label}</h2>
      <span className="font-mono text-xs text-white/30" aria-label={`${count} items`}>
        {count} {count === 1 ? 'item' : 'items'}
      </span>
    </div>
  )
}
