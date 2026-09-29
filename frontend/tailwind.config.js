/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bank: {
          navy: '#0F2744',
          'navy-dark': '#0A192F',
          'navy-light': '#1E3A5F',
          blue: '#1E40AF',
          sky: '#0284C7',
          teal: '#0D9488',
          emerald: '#10B981',
          amber: '#D97706',
          red: '#DC2626',
          gray: '#F8FAFC',
          border: '#E2E8F0',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(15, 39, 68, 0.05), 0 1px 2px -1px rgba(15, 39, 68, 0.05)',
        'card': '0 4px 6px -1px rgba(15, 39, 68, 0.05), 0 2px 4px -2px rgba(15, 39, 68, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(15, 39, 68, 0.08), 0 4px 6px -4px rgba(15, 39, 68, 0.04)',
      },
    },
  },
  plugins: [],
}
