import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.5rem', lg: '3rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        ala: {
          navy: '#0A2647',
          'navy-deep': '#061A33',
          'navy-soft': '#14477A',
          red: '#C8102E',
          'red-dark': '#9B0C23',
          gold: '#C9A227',
          white: '#FFFFFF',
          'grey-50': '#F4F6F9',
          'grey-200': '#E2E8F0',
          'grey-500': '#64748B',
          ink: '#0F172A',
        },
      },
      fontFamily: {
        heading: ['Sora', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h2: ['clamp(2rem, 3.5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        h3: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        body: ['1.0625rem', { lineHeight: '1.7' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.12em' }],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        input: '4px',
      },
      boxShadow: {
        soft: '0 4px 24px rgba(10,38,71,0.08)',
        'soft-lg': '0 12px 40px rgba(10,38,71,0.12)',
      },
      maxWidth: { container: '1280px' },
      spacing: {
        'section-y': '8rem',
        'section-y-sm': '4rem',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out both',
      },
    },
  },
  plugins: [],
} satisfies Config;
