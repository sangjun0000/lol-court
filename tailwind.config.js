/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'lol-gold': '#FFD700',
        'lol-blue': '#1E90FF',
        'lol-red': '#DC143C',
        'court-brown': '#8B4513',
      },
    },
  },
  plugins: [],
}
