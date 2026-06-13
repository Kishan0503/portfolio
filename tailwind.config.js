/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#05060A',
        panel: '#0A0B14',
        'deep-blue': '#0B1E3F',
        'deep-blue-bright': '#1A2B6B',
        purple: '#7C3AED',
        'purple-bright': '#A855F7',
        cyan: '#22D3EE',
        glass: 'rgba(255,255,255,0.04)',
        'glass-border': 'rgba(255,255,255,0.08)',
        'text-primary': '#F5F6FA',
        'text-muted': '#9AA3B2',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(124,58,237,0.45)',
        'glow-sm': '0 0 20px -6px rgba(124,58,237,0.4)',
        'glow-lg': '0 0 80px -10px rgba(124,58,237,0.5)',
        'glow-cyan': '0 0 30px -6px rgba(34,211,238,0.45)',
      },
      backdropBlur: {
        glass: '14px',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
