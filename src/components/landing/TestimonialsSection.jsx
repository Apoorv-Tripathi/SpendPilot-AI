import { TESTIMONIALS } from '../../constants'

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ borderTop: '1px solid #21262D' }}>
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-14">
          <span className="section-tag mb-5 inline-flex">What teams say</span>
          <h2 className="font-display font-extrabold mt-4" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#E6EDF3' }}>
            Real results, real savings
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card-glass-hover p-7 rounded-2xl flex flex-col gap-5">

              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: '#58A6FF', fontSize: '12px' }}>★</span>
                ))}
              </div>

              <p className="font-body text-sm leading-relaxed flex-1" style={{ color: '#8B949E' }}>
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid #21262D' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs"
                  style={{ background: 'rgba(88,166,255,0.10)', color: '#58A6FF', border: '1px solid rgba(88,166,255,0.20)' }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="font-display font-semibold text-sm" style={{ color: '#E6EDF3' }}>{t.name}</div>
                  <div className="font-body text-xs" style={{ color: '#484F58' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
