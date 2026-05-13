export default function FormProgress({ formState, totals }) {
  const steps = [
    { label: 'Team info', done: !!(formState.teamSize && formState.primaryUseCase) },
    { label: 'Tools logged', done: totals.toolCount > 0 },
    { label: 'Spend entered', done: totals.totalMonthlySpend > 0 },
  ]

  const completedCount = steps.filter(s => s.done).length
  const pct = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-[120px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-body text-xs text-white/40">Completion</span>
          <span className="font-mono text-xs text-acid">{pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden"
  style={{ background: '#21262D' }}>
  <div
    className="h-full rounded-full transition-all duration-500"
    style={{
      width: `${pct}%`,
      background: 'linear-gradient(90deg, #388BFD, #58A6FF)',
    }}
  />
</div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300`}
  style={{
    background: step.done ? '#58A6FF' : 'transparent',
    borderColor: step.done ? '#58A6FF' : '#30363D',
  }}>
              {step.done && (
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4L3 6L7 2" stroke="#0D1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="font-body text-xs transition-colors"
  style={{ color: step.done ? '#8B949E' : '#30363D' }}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
