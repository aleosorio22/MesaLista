/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Color principal del sistema (Verde)
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Verde principal de los iconos y elementos activos
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Grises para backgrounds y textos
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Color de fondo del sidebar
        sidebar: {
          DEFAULT: '#f8fafc',
          dark: '#1e293b',
        },
        // Color de fondo principal
        background: {
          DEFAULT: '#ffffff',
          secondary: '#f8fafc',
          muted: '#f1f5f9',
        },
        // Colores de texto
        text: {
          primary: '#0f172a',
          secondary: '#64748b',
          muted: '#94a3b8',
          light: '#cbd5e1',
        },
        // Colores para estados
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Color para elementos destacados como badges de notificaciones
        accent: {
          DEFAULT: '#22c55e',
          hover: '#16a34a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

