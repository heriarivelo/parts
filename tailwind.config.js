/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#dc2626',
        secondary: '#6c757d',
        accent: '#f59e0b',
        method1: '#3B82F6',
        method2: '#10B981',
        final: '#8b5cf6'
      },
      fontFamily: {
          sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

