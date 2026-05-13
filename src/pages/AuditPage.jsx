import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RotateCcw, ArrowRight, Save, Info, Zap } from 'lucide-react'
import { useAuditForm } from '../hooks/useAuditForm'
import { USE_CASES } from '../constants'
import { formatLastSaved } from '../utils'
import ToolCard from '../components/form/ToolCard'
import SpendSummary from '../components/form/SpendSummary'
import FormProgress from '../components/form/FormProgress'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

export default function AuditPage({ onGenerateReport, reportLoading }) {
  const navigate = useNavigate()
  const {
    formState,
    updateField,
    addTool,
    removeTool,
    updateTool,
    duplicateTool,
    resetForm,
    totals,
    isValid,
    isDirty,
    lastSaved,
  } = useAuditForm()

  const [showResetConfirm, setShowResetConfirm] = useState(false)

function handleSubmit(e) {
  e.preventDefault()
  if (!isValid || reportLoading) return
  onGenerateReport(formState)
  setTimeout(() => {
    resetForm()
    navigate('/results')
  }, 700)
}

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Page header */}
        <div className="mb-10">
          <span className="section-tag mb-4 inline-flex">
            <Zap size={10} className="fill-acid" />
            Free Audit
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight gradient-text mt-3">
            Your AI Spend Audit
          </h1>
          <p className="mt-3 text-white/40 font-body text-base max-w-xl">
            Log every AI tool your team uses. We'll calculate your total spend, per-seat cost, and surface optimization opportunities.
          </p>

          {/* Auto-save status */}
          <div className="mt-4 flex items-center gap-2 text-white/30 font-mono text-xs">
            <Save size={11} />
            {isDirty
              ? 'Saving…'
              : lastSaved
                ? formatLastSaved(lastSaved)
                : 'Auto-saved to browser'
            }
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 card-glass border border-white/[0.06] rounded-2xl p-5">
          <FormProgress formState={formState} totals={totals} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">

            {/* Left: Form */}
            <div className="space-y-8">

              {/* Section 1: Team Context */}
              <fieldset className="card-glass border border-white/[0.08] rounded-2xl p-6">
                <legend className="sr-only">Team Information</legend>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center">
                    <span className="font-mono text-acid text-xs">01</span>
                  </div>
                  <h2 className="font-display font-bold text-base text-white">Team Context</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="Team Size"
                    id="team-size"
                    type="number"
                    value={formState.teamSize}
                    onChange={val => updateField('teamSize', val)}
                    placeholder="12"
                    suffix="people"
                    min="1"
                    required
                  />
                  <Select
                    label="Primary Use Case"
                    id="use-case"
                    value={formState.primaryUseCase}
                    onChange={val => updateField('primaryUseCase', val)}
                    options={USE_CASES}
                    placeholder="What's AI used for?"
                    required
                  />
                </div>
              </fieldset>

              {/* Section 2: AI Tools */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center">
                    <span className="font-mono text-acid text-xs">02</span>
                  </div>
                  <h2 className="font-display font-bold text-base text-white">
                    AI Tools
                    <span className="ml-2 font-mono text-xs text-white/30 font-normal">
                      ({formState.tools.length} {formState.tools.length === 1 ? 'entry' : 'entries'})
                    </span>
                  </h2>
                </div>

                <div className="flex items-start gap-2 mb-5 bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
                  <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="font-body text-xs text-white/40 leading-relaxed">
                    Add all AI tools your team pays for — including individual subscriptions, team plans, and API usage. Estimates are fine.
                  </p>
                </div>

                {/* Tool cards */}
                <div className="space-y-4">
                  {formState.tools.map((tool, i) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      index={i}
                      onUpdate={updateTool}
                      onRemove={removeTool}
                      onDuplicate={duplicateTool}
                      canRemove={formState.tools.length > 1}
                    />
                  ))}
                </div>

                {/* Add tool button */}
                <button
                  type="button"
                  onClick={addTool}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-white/10 text-white/30 hover:border-acid/30 hover:text-acid/70 hover:bg-acid/5 font-body text-sm transition-all duration-200 group"
                >
                  <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
                  Add another tool
                </button>
              </div>

              {/* Form actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={!isValid || reportLoading}
                  className="btn-primary py-4 px-10 text-sm w-full sm:w-auto justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                >
                  {reportLoading ? (
                    <>
                      <span className="flex gap-1">
                        {[0,1,2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-ink animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                      </span>
                      Generating…
                    </>
                  ) : (
                    <>
                      Generate Audit Report
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Reset */}
                {!showResetConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="btn-ghost text-white/30 hover:text-red-400 text-sm"
                  >
                    <RotateCcw size={14} />
                    Reset form
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-body text-xs text-white/40">Sure?</span>
                    <button
                      type="button"
                      onClick={() => { resetForm(); setShowResetConfirm(false) }}
                      className="font-body text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-all"
                    >
                      Yes, reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="font-body text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!isValid && (
                <p className="font-body text-xs text-white/25 -mt-2">
                  Complete team size, use case, and at least one tool with spend to generate your report.
                </p>
              )}
            </div>

            {/* Right: Live Summary Sidebar */}
            <div className="lg:block">
              <SpendSummary
                tools={formState.tools}
                teamSize={formState.teamSize}
                totals={totals}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
