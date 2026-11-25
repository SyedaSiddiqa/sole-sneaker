/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        'gold-light': 'rgb(var(--gold-light) / <alpha-value>)',
        'gold-hover': 'rgb(var(--gold-hover) / <alpha-value>)',
        card: 'var(--card)',
        'card-solid': 'var(--card-solid)',
        border: 'var(--border)',
        'btn-bg': 'var(--btn-bg)',
        'btn-text': 'var(--btn-text)',
        navbar: 'var(--navbar)',
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Anton"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
