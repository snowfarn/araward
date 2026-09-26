/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-anuphan)', 'var(--font-jakarta)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-outfit)', 'var(--font-jakarta)', 'var(--font-anuphan)', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
        mono: ['var(--font-jakarta)', 'ui-sans-serif', 'sans-serif'],
        thai: ['var(--font-anuphan)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
