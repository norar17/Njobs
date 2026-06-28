/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#FAFAF8',
          100: '#FFFFFF',
          200: '#F3F2EE',
          300: '#E8E6E0',
        },
        ink: {
          DEFAULT: '#14151A',
          700: '#2B2D35',
          500: '#5B5E6B',
          400: '#8A8D99',
          300: '#C7C9D1',
        },
        dark: {
          950: '#0C0E12',
          900: '#111317',
          850: '#161A20',
          800: '#1C212A',
          700: '#272D38',
          600: '#384151',
        },
        brand: {
          DEFAULT: '#0F766E',
          50: '#ECFDF8',
          100: '#D6F5EE',
          400: '#159E92',
          500: '#0F766E',
          600: '#0C5F58',
          700: '#0A4D47',
        },
        gold: {
          DEFAULT: '#D97706',
          400: '#F2A93B',
          500: '#D97706',
        },
        status: {
          pending: '#D97706',
          reviewed: '#3B82F6',
          accepted: '#0F766E',
          rejected: '#DC2626',
        },
      },
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,21,26,0.04), 0 1px 1px rgba(20,21,26,0.03)',
        'card-hover': '0 8px 20px -6px rgba(20,21,26,0.12)',
        'card-dark': '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -10px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(15,118,110,0.4), 0 0 20px -4px rgba(15,118,110,0.45)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
