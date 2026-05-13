import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Zap } from 'lucide-react'

const navLinks = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About',        href: '/#about' },
]

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname }          = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(13,17,23,0.92)'
          : 'transparent',
        borderBottom: scrolled ? '1px solid #21262D' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        padding: scrolled ? '12px 0' : '20px 0',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #388BFD, #58A6FF)', boxShadow: '0 2px 8px rgba(88,166,255,0.3)' }}>
              <Zap size={15} className="text-white fill-white" />
            </div>
            <span className="font-display font-bold text-lg" style={{ color: '#E6EDF3', letterSpacing: '-0.01em' }}>
              Spend<span style={{ color: '#58A6FF' }}>Lens</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm rounded-lg transition-all duration-200 font-body font-medium"
                style={{ color: '#8B949E' }}
                onMouseEnter={e => { e.target.style.color = '#E6EDF3'; e.target.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { e.target.style.color = '#8B949E'; e.target.style.background = 'transparent' }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/audit" className="btn-primary text-xs py-2.5 px-5">
              Start Free Audit
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg transition-all"
            style={{ color: '#8B949E' }}
            onClick={() => setOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden mt-4 pb-4 animate-fade-up" style={{ borderTop: '1px solid #21262D' }}>
            <nav className="flex flex-col gap-1 mt-4">
              {navLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-3 text-sm rounded-xl font-body font-medium transition-all"
                  style={{ color: '#8B949E' }}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                to="/audit"
                className="btn-primary mt-3 justify-center"
                onClick={() => setOpen(false)}
              >
                Start Free Audit
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
