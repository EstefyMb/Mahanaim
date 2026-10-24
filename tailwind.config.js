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
        midnight: {
          950: '#070b14', // Fondo ultra profundo
          900: '#0d1527', // Fondo de tarjetas
          850: '#111c34', // Superficie destacada
          800: '#172545', // Bordes sutiles
          700: '#233863',
        },
        celestial: {
          gold: '#fbbf24', // Luz Celestial dorada
          'gold-light': '#fef3c7',
          sky: '#38bdf8', // Azul etéreo
          indigo: '#6366f1', // Azul real / Adoración
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'celestial-gold': '0 0 25px -5px rgba(251, 191, 36, 0.25)',
        'celestial-sky': '0 0 25px -5px rgba(56, 189, 248, 0.25)',
        'celestial-card': '0 10px 30px -10px rgba(7, 11, 20, 0.5)',
      }
    },
  },
  plugins: [],
}
