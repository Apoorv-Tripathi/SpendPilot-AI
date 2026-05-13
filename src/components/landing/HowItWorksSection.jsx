import { ClipboardList, BarChart3, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  {
    step: '01',
    title: 'Log Your AI Tools',
    description: 'Add every AI subscription your team uses — from coding assistants to LLM APIs. Capture plans, seats, and monthly spend in one place.',
    icon: ClipboardList,
    iconBg: 'rgba(88,166,255,0.10)',
    iconColor: '#58A6FF',
    borderColor: 'rgba(88,166,255,0.15)',
  },
  {
    step: '02',
    title: 'Instant Cost Breakdown',
    description: 'See your total AI spend by tool, team size, and cost-per-seat. Immediately identify which tools are carrying their weight.',
    icon: BarChart3,
    iconBg: 'rgba(45,212,191,0.10)',
    iconColor: '#2DD4BF',
    borderColor: 'rgba(45,212,191,0.15)',
  },
  {
    step: '03',
    title: 'Get Optimization Insights',
    description: 'Receive actionable recommendations to cut waste, consolidate redundant tools, and negotiate better enterprise contracts.',
    icon: Zap,
    iconBg: 'rgba(139,114,239,0.10)',
    iconColor: '#8B72EF',
    borderColor: 'rgba(139,114,239,0.15)',
  },
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <span className="section-tag mb-5 inline-flex">How It Works</span>
          <h2 className="font-display font-extrabold tracking-tight mt-4 mb-5"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#E6EDF3' }}>
            Clarity in three steps
          </h2>
          <p className="font-body text-base max-w-lg mx-auto" style={{ color: '#8B949E', lineHeight: '1.7' }}>
            No integrations. No waiting. Just fill in what you pay and let SpendLens surface the waste.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={i}
                className="relative p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 group"
                style={{
                  background: 'rgba(22,27,34,0.7)',
                  border: `1px solid ${step.borderColor}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}>

                {/* Step number — watermark */}
                <div className="absolute top-5 right-6 font-mono font-bold text-5xl select-none"
                  style={{ color: '#21262D', lineHeight: 1 }}>
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: step.iconBg }}>
                  <Icon size={20} style={{ color: step.iconColor }} />
                </div>

                <h3 className="font-display font-bold text-lg mb-3" style={{ color: '#E6EDF3' }}>
                  {step.title}
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: '#8B949E' }}>
                  {step.description}
                </p>

                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full items-center justify-center"
                    style={{ background: '#161B22', border: '1px solid #30363D' }}>
                    <ArrowRight size={12} style={{ color: '#484F58' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link to="/audit" className="btn-primary px-10 py-4 text-sm inline-flex">
            Run Your Audit Now
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
