import { useState } from 'react'

export default function Tooltip({ children, content }) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-fade-in">
          <div className="bg-ink-muted border border-white/10 rounded-lg px-3 py-1.5 text-white/80 font-body text-xs whitespace-nowrap shadow-2xl">
            {content}
          </div>
          <div className="w-2 h-2 bg-ink-muted border-b border-r border-white/10 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45" />
        </div>
      )}
    </div>
  )
}
