import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Clock, TrendingDown } from 'lucide-react'

const floatingBadges = [
  { icon: '⌘', name: 'Cursor',    spend: '$1,200/mo', color: '#7C6FF7', pos: 'top-10 left-6 md:left-16' },
  { icon: '◉', name: 'ChatGPT',  spend: '$600/mo',   color: '#10A37F', pos: 'top-20 right-6 md:right-20' },
  { icon: '◆', name: 'Claude',   spend: '$450/mo',   color: '#D4774A', pos: 'bottom-24 left-4 md:left-20' },
  { icon: '◎', name: 'Copilot',  spend: '$760/mo',   color: '#6E40C9', pos: 'bottom-16 right-4 md:right-12' },
]

const trustItems = [
  { icon: ShieldCheck, label: 'No account required' },
  { icon: TrendingDown, label: 'Instant cost insights' },
  { icon: Clock, label: 'Results in 14 minutes' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(88,166,255,0.05) 0%, transparent 65%)' }} />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 65%)' }} />
      </div>

      {/* Floating tool badges */}
      {floatingBadges.map((badge, i) => (
        <div
          key={badge.name}
          className={`absolute ${badge.pos} z-10 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl animate-float`}
          style={{
            background: 'rgba(22,27,34,0.85)',
            border: `1px solid ${badge.color}25`,
            backdropFilter: 'blur(12px)',
            animationDelay: `${i * 1.1}s`,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{ background: `${badge.color}18`, color: badge.color }}>
            {badge.icon}
          </div>
          <div>
            <div className="font-display font-semibold text-xs" style={{ color: '#E6EDF3' }}>{badge.name}</div>
            <div className="font-mono text-xs" style={{ color: '#484F58' }}>{badge.spend}</div>
          </div>
        </div>
      ))}

      {/* Hero content */}
      <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 text-center">

        {/* Tag */}
        <div className="animate-fade-up">
          <span className="section-tag mb-8 inline-flex">AI Spend Intelligence</span>
        </div>

        {/* Headline */}
        <h1 className="font-display font-extrabold tracking-tight mt-6 animate-fade-up animate-delay-100"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', lineHeight: '1.05', color: '#E6EDF3' }}>
          Stop overpaying for{' '}
          <span className="brand-gradient-text">AI tools</span>
          <br />your team barely uses.
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base sm:text-lg leading-relaxed animate-fade-up animate-delay-200 max-w-xl mx-auto"
          style={{ color: '#8B949E' }}>
          Teams waste an average of{' '}
          <span style={{ color: '#E6EDF3', fontWeight: 500 }}>$340,000/year</span>{' '}
          on redundant AI subscriptions. SpendLens audits your entire stack and finds savings in under 15 minutes — free.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-300">
          <Link to="/audit" className="btn-primary text-sm px-8 py-4 w-full sm:w-auto justify-center animate-pulse-brand">
            Start Your Free Audit
            <ArrowRight size={16} />
          </Link>
          <a href="#how-it-works" className="btn-outline text-sm px-8 py-4 w-full sm:w-auto justify-center">
            See How It Works
          </a>
        </div>

        {/* Trust bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 animate-fade-up animate-delay-400">
          {trustItems.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm font-body" style={{ color: '#484F58' }}>
              <Icon size={14} style={{ color: '#2DD4BF' }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0D1117)' }} />
    </section>
  )
}
