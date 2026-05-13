import { STATS } from '../../constants'

export default function StatsBar() {
  return (
    <section className="py-16" style={{ borderTop: '1px solid #21262D', borderBottom: '1px solid #21262D' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-display font-extrabold text-3xl md:text-4xl mb-2 brand-gradient-text">
                {stat.value}
              </div>
              <div className="font-body text-sm leading-snug" style={{ color: '#8B949E' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
