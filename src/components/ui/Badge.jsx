export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-white/5 text-white/50 border-white/10',
    acid: 'bg-acid/10 text-acid border-acid/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border font-mono text-xs ${variants[variant]}`}>
      {children}
    </span>
  )
}
