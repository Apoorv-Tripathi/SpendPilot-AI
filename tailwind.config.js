/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Base — deep navy, not pure black
        ink: {
          DEFAULT: '#0D1117',   // GitHub-dark navy — easier on eyes
          soft:    '#161B22',   // card backgrounds
          muted:   '#21262D',   // borders, dividers
          light:   '#30363D',   // hover states
        },
        // Primary accent — electric blue (replaces acid yellow-green)
        brand: {
          DEFAULT: '#58A6FF',   // bright, readable blue
          dim:     '#388BFD',   // hover state
          pale:    '#A5D6FF',   // light tint
          glow:    'rgba(88,166,255,0.25)',
        },
        // Secondary accent — teal for highlights
        teal: {
          DEFAULT: '#2DD4BF',
          dim:     '#14B8A6',
          pale:    '#99F6E4',
        },
        // Text hierarchy
        ivory: {
          DEFAULT: '#E6EDF3',   // primary text — warm white, not pure
          muted:   '#8B949E',   // secondary text
          faint:   '#484F58',   // placeholder, disabled
        },
      },
      backgroundImage: {
        'grid-navy': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0v40M40 0v40M0 0h40M0 40h40' stroke='%2358A6FF09' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up':    'fadeUp 0.6s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-in':   'slideIn 0.5s ease forwards',
        'pulse-brand':'pulseBrand 2.5s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'shimmer':    'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-12px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
        pulseBrand: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(88,166,255,0.20)' },
          '50%':     { boxShadow: '0 0 0 8px rgba(88,166,255,0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
