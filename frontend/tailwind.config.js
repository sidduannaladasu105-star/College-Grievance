/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c2d8eb',
          300: '#94bfe0',
          400: '#5e9ed0',
          500: '#387ebc',
          600: '#28649e',
          700: '#225080',
          800: '#1e436a',
          900: '#0f2744',
          950: '#0b192e',
        },
        primary: {
          DEFAULT: '#1E3A8A', // Classic Deep Navy Blue
          light: '#3B82F6',
          dark: '#0F172A',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          500: '#0ea5e9',
          600: '#0284c7',
        }
      }
    },
  },
  plugins: [],
}
