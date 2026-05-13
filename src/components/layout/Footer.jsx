import { Link } from 'react-router-dom'
import { Zap, Github, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-10 px-4" style={{ borderTop: '1px solid #21262D' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #388BFD, #58A6FF)' }}>
              <Zap size={13} className="text-white fill-white" />
            </div>
            <span className="font-display font-bold text-base" style={{ color: '#E6EDF3' }}>
              Spend<span style={{ color: '#58A6FF' }}>Lens</span>
            </span>
          </Link>

          <p className="font-body text-sm text-center" style={{ color: '#484F58' }}>
            Designed & developed by <span style={{ color: '#58A6FF', fontWeight: 600 }}>Apoorv Tripathi</span> · © {new Date().getFullYear()}
          </p>

          <div className="flex items-center gap-4">
            <a href="#" className="transition-colors" style={{ color: '#484F58' }}
              onMouseEnter={e => e.target.style.color = '#58A6FF'}
              onMouseLeave={e => e.target.style.color = '#484F58'}>
              <Github size={17} />
            </a>
            <a href="#" className="transition-colors" style={{ color: '#484F58' }}
              onMouseEnter={e => e.target.style.color = '#58A6FF'}
              onMouseLeave={e => e.target.style.color = '#484F58'}>
              <Twitter size={17} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
