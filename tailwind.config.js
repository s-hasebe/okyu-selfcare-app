/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Velocity Backgrounds ──
        'v-base':      '#0d0c0b',
        'v-surface':   '#161412',
        'v-elevated':  '#1e1b18',
        'v-subtle':    '#252018',
        // ── Velocity Brand (Orange) ──
        'v-brand':     '#e8540a',
        'v-brand-lt':  '#f97316',
        // ── Velocity Text ──
        'v-primary':   '#f5f0ea',
        'v-secondary': '#b8a99a',
        'v-muted':     '#6b5f54',
        // ── 後方互換エイリアス（既存コードが壊れない）──
        'okyu-dark':     '#0d0c0b',
        'okyu-charcoal': '#161412',
        'okyu-red':      '#e8540a',
        'okyu-amber':    '#f97316',
        'okyu-cream':    '#f5f0ea',
        'okyu-sand':     '#b8a99a',
        'okyu-smoke':    '#6b5f54',
        'okyu-brown':    '#7D4E2A',
      },
      fontFamily: {
        'display-ja': ['"Hina Mincho"', 'serif'],
        'display':    ['"Syne"', '"Hina Mincho"', 'serif'],
        'body':       ['"DM Sans"', '"Hina Mincho"', 'sans-serif'],
        'body-ja':    ['"Hina Mincho"', '"Noto Serif JP"', 'serif'],
        'label':      ['"JetBrains Mono"', 'monospace'],
        // 後方互換
        'sans':       ['"DM Sans"', '"Hina Mincho"', 'sans-serif'],
        'serif':      ['"Hina Mincho"', 'serif'],
      },
      borderRadius: {
        'sm':   '6px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '24px',
        '2xl':  '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(232, 84, 10, 0.4)',
        'glow-md': '0 0 32px rgba(232, 84, 10, 0.35), 0 0 8px rgba(232, 84, 10, 0.6)',
        'glow-lg': '0 0 60px rgba(232, 84, 10, 0.3), 0 0 120px rgba(232, 84, 10, 0.15)',
        'elevation-md': '0 4px 16px rgba(0,0,0,0.5)',
        'elevation-lg': '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-up':    'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':    'fadeIn 0.4s ease-in-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'spin':       'spin 1s linear infinite',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 32px rgba(232,84,10,0.35), 0 0 8px rgba(232,84,10,0.6)' },
          '50%':      { boxShadow: '0 0 60px rgba(232,84,10,0.3), 0 0 120px rgba(232,84,10,0.15)' },
        },
      },
      letterSpacing: {
        'tight':      '-0.03em',
        'normal':     '-0.01em',
        'wide':       '0.06em',
        'wider':      '0.1em',
        'ja-display': '0.15em',
        'ja-body':    '0.05em',
      },
      lineHeight: {
        'tight':   '1.15',
        'snug':    '1.3',
        'normal':  '1.55',
        'relaxed': '1.75',
        'ja':      '1.9',
      },
    },
  },
  plugins: [],
}
