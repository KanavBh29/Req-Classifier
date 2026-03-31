/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f3f0ff',
          100: '#e9e3ff',
          200: '#d5cbff',
          300: '#b8a5ff',
          400: '#9470ff',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#8b5cf6",
          "primary-content": "#ffffff",
          "secondary": "#a78bfa",
          "secondary-content": "#ffffff",
          "accent": "#c4b5fd",
          "accent-content": "#111111",
          "neutral": "#171717",
          "neutral-content": "#f4f4f5",
          "base-100": "#0a0a0a",
          "base-200": "#121212",
          "base-300": "#1d1d1f",
          "base-content": "#f5f5f5",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
        light: {
          "primary": "#7c3aed",
          "primary-content": "#ffffff",
          "secondary": "#8b5cf6",
          "secondary-content": "#ffffff",
          "accent": "#a78bfa",
          "accent-content": "#ffffff",
          "neutral": "#f5f5f5",
          "neutral-content": "#18181b",
          "base-100": "#ffffff",
          "base-200": "#fafafa",
          "base-300": "#f2f2f4",
          "base-content": "#18181b",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        }
      }
    ],
    defaultTheme: "dark",
  }
}
