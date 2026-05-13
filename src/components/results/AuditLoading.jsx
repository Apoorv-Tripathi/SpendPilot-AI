export default function AuditLoading() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Hero skeleton */}
        <div className="text-center mb-12 animate-pulse">
          <div className="h-5 w-32 bg-white/[0.06] rounded-full mx-auto mb-8" />
          <div className="h-12 w-2/3 bg-white/[0.06] rounded-2xl mx-auto mb-4" />
          <div className="h-5 w-1/2 bg-white/[0.04] rounded-xl mx-auto" />
          <div className="w-36 h-36 rounded-full bg-white/[0.04] mx-auto mt-10" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-12 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="card-glass border border-white/[0.06] rounded-2xl p-6 h-32" />
          ))}
        </div>

        {/* Findings skeleton */}
        <div className="space-y-4 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="card-glass border border-white/[0.06] rounded-2xl p-6 h-20" />
          ))}
        </div>

        {/* Loading indicator */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-ink-soft border border-white/10 rounded-2xl px-6 py-3 shadow-2xl">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-acid animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <span className="font-body text-sm text-white/60">Running audit engine…</span>
        </div>
      </div>
    </div>
  )
}
