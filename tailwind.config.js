/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      colors: {
        bible: {
          50: '#fdfbf7',
          100: '#f9f5eb',
          200: '#f1e8d4',
          300: '#e5d3b0',
          400: '#d5b683',
          500: '#c59a5c',
          600: '#aa7e46',
          700: '#896238',
          800: '#714f33',
          900: '#5e412d',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}