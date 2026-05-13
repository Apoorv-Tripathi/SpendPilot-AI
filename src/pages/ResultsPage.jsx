import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Zap } from 'lucide-react'
import { groupFindingsByTool } from '../engine/auditEngine.js'
import { TOOL_KNOWLEDGE } from '../engine/auditKnowledge.js'
import ResultsHero         from '../components/results/ResultsHero'
import ToolResultCard      from '../components/results/ToolResultCard'
import GlobalFindingsPanel from '../components/results/GlobalFindingsPanel'
import SavingsBreakdown    from '../components/results/SavingsBreakdown'
import ResultsCTA          from '../components/results/ResultsCTA'
import AuditLoading        from '../components/results/AuditLoading'

export default function ResultsPage({ report, loading, onReset, publicId }) {
  useEffect(() => { window.scrollTo({ top: 0 }) }, [])

  if (loading) return <AuditLoading />

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
            <Zap size={24} className="text-white/20" />
          </div>
          <h1 className="font-display font-bold text-2xl text-white mb-3">No audit report found</h1>
          <p className="font-body text-white/40 text-sm mb-8">
            Complete the audit form to generate your personalised spend analysis.
          </p>
          <Link to="/audit" className="btn-primary text-sm px-8 py-3 inline-flex">
            Start Audit
          </Link>
        </div>
      </div>
    )
  }

  const { findings, metrics, verdict, context, tools, generatedAt } = report

  const globalFindings = findings.filter(
    f => f.toolId === 'global' && (!f.affectedTools || f.affectedTools.length > 1)
  )

  const activeTools = tools.filter(t => t.monthlySpend > 0 && TOOL_KNOWLEDGE[t.toolId])

  const globalFindingIds = new Set(globalFindings.map(f => f.id))
  const perToolFindings  = groupFindingsByTool(
    findings.filter(f => !globalFindingIds.has(f.id)),
    activeTools
  )

  return (
    <div className="min-h-screen">

      <ResultsHero
        metrics={metrics}
        verdict={verdict}
        context={context}
        generatedAt={generatedAt}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {/* Nav */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <Link
            to="/audit"
            className="btn-ghost text-white/40 hover:text-white text-sm flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            Back to form
          </Link>
          <button
            onClick={onReset}
            className="btn-ghost text-white/40 hover:text-white text-sm flex items-center gap-2"
          >
            <RotateCcw size={14} />
            New audit
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

          {/* Left: findings */}
          <div className="space-y-6">

            {globalFindings.length > 0 && (
              <section>
                <SectionLabel step="01" label="Cross-Tool Issues" count={globalFindings.length} />
                <GlobalFindingsPanel findings={globalFindings} />
              </section>
            )}

            {activeTools.length > 0 && (
              <section>
                <SectionLabel
                  step={globalFindings.length > 0 ? '02' : '01'}
                  label="Per-Tool Analysis"
                  count={activeTools.length}
                />
                <div className="space-y-4">
                  {activeTools.map(tool => (
                    <ToolResultCard
                      key={tool.id}
                      toolEntry={tool}
                      findings={perToolFindings.get(tool.toolId) ?? []}
                    />
                  ))}
                </div>
              </section>
            )}
            {/* AI Summary — prominent, in main column */}
{report.aiSummary?.text && (
  <div className="rounded-2xl p-6"
    style={{
      background: 'linear-gradient(135deg, rgba(88,166,255,0.08) 0%, rgba(45,212,191,0.05) 100%)',
      border: '1px solid rgba(88,166,255,0.20)',
    }}>
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full" style={{ background: '#58A6FF' }} />
      <span className="font-mono text-xs font-semibold uppercase tracking-widest" style={{ color: '#58A6FF' }}>
        ✦ AI-Generated Summary
      </span>
      {report.aiSummary.isFallback && (
        <span className="font-mono text-xs" style={{ color: '#484F58' }}>(auto)</span>
      )}
    </div>
    <p className="font-body text-sm leading-relaxed" style={{ color: '#C9D1D9', lineHeight: '1.75' }}>
      {report.aiSummary.text}
    </p>
  </div>
)}

            {findings.length === 0 && (
              <div className="card-glass border border-white/[0.06] rounded-2xl p-12 text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="font-display font-bold text-xl text-white mb-2">No issues found</h3>
                <p className="font-body text-white/40 text-sm">
                  Your AI stack looks clean. Come back as your team and tooling evolves.
                </p>
              </div>
            )}
          </div>

          {/* Right: savings sidebar */}
          <div className="space-y-6">
            <SavingsBreakdown findings={findings} metrics={metrics} />

            {/* Quick stats */}
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
                  color: metrics.wasteScore >= 75
                    ? 'text-emerald-400'
                    : metrics.wasteScore >= 50
                      ? 'text-yellow-400'
                      : 'text-red-400',
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
          </div>
        </div>
      </div>

      {/* CTA — now receives publicId for lead capture */}
      <ResultsCTA metrics={metrics} onReset={onReset} publicId={publicId} />
    </div>
  )
}

function SectionLabel({ step, label, count }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-6 h-6 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center">
        <span className="font-mono text-acid text-xs">{step}</span>
      </div>
      <h2 className="font-display font-bold text-base text-white">{label}</h2>
      <span className="font-mono text-xs text-white/30">{count} {count === 1 ? 'item' : 'items'}</span>
    </div>
  )
}
