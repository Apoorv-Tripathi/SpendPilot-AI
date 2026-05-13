import { Link } from 'react-router-dom'
import { ArrowRight, Zap } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" id="about">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-3xl p-12 md:p-16 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(22,27,34,0.95) 0%, rgba(33,38,45,0.95) 100%)',
            border: '1px solid rgba(88,166,255,0.20)',
            boxShadow: '0 0 60px rgba(88,166,255,0.06), 0 24px 48px rgba(0,0,0,0.3)',
          }}>

          {/* Subtle glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(88,166,255,0.08) 0%, transparent 60%)' }} />

          <div className="relative z-10">
            {/* Icon */}
            <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-8"
              style={{ background: 'linear-gradient(135deg, #388BFD, #2DD4BF)', boxShadow: '0 4px 24px rgba(88,166,255,0.30)' }}>
              <Zap size={24} className="text-white fill-white" />
            </div>

            <h2 className="font-display font-extrabold mb-4"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#E6EDF3', lineHeight: '1.15' }}>
              Stop guessing.
              <br />
              <span className="brand-gradient-text">Start auditing.</span>
            </h2>

            <p className="font-body text-base leading-relaxed max-w-lg mx-auto mb-10" style={{ color: '#8B949E' }}>
              Your first AI spend audit is free, takes 14 minutes, and shows you exactly where your budget is going — and how to reclaim it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link to="/audit" className="btn-primary px-10 py-4 text-sm w-full sm:w-auto justify-center">
                Start Free Audit
                <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="btn-outline text-sm px-8 py-4 w-full sm:w-auto justify-center">
                Learn how it works
              </a>
            </div>

            <p className="mt-6 font-body text-xs" style={{ color: '#484F58' }}>
              No account required · No credit card · Your data stays in your browser
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
