/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'app-bg': '#0b1020',
        'app-panel': '#0f1630',
        'app-muted': '#9fb0d0',
        'app-text': '#e8eeff',
        'app-primary': '#6aa6ff',
        'app-primary-700': '#3c7bf7',
        'app-border': '#223153',
        'app-success': '#2cd498',
        'app-danger': '#ff6a7d',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Ubuntu', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      backgroundImage: {
        'app-gradient': 'radial-gradient(1200px 600px at 20% -10%, #1d2a58 0%, #0b1020 60%)',
      }
    },
  },
  plugins: [],
}
