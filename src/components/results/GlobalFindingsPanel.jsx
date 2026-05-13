import FindingCard from './FindingCard'
import { Globe } from 'lucide-react'

export default function GlobalFindingsPanel({ findings }) {
  if (!findings || findings.length === 0) return null

  return (
    <div className="card-glass border border-purple-500/15 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.05]">
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Globe size={16} className="text-purple-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-white">Cross-Tool Findings</h3>
          <p className="font-body text-xs text-white/40">Issues spanning multiple tools in your stack</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {findings.map((finding, i) => (
          <FindingCard key={finding.id} finding={finding} index={i} />
        ))}
      </div>
    </div>
  )
}
