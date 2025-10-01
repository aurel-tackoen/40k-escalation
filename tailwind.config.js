/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wh-gold': '#C9B037',
        'wh-red': '#8B0000',
        'wh-dark': '#1A1A1A',
        'wh-skull': '#F5F5DC',
      },
      fontFamily: {
        'gothic': ['Cinzel', 'serif'],
      }
    },
  },
  plugins: [],
}