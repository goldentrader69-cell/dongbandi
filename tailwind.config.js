/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eefdf5',
          100: '#d6f9e8',
          200: '#b0f2d4',
          300: '#7be6ba',
          400: '#40cf97',
          500: '#16b47d',
          600: '#0a9166',
          700: '#097354',
          800: '#0a5b44',
          900: '#094b39',
          950: '#022c22',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(0,0,0,0.08)',
        card: '0 4px 24px -4px rgba(0,0,0,0.10)',
        glow: '0 0 0 1px rgba(22,180,125,0.2), 0 8px 32px -8px rgba(22,180,125,0.25)',
      },
    },
  },
  plugins: [],
};
