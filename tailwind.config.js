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
        // Iridia Labs Brand Colors
        iridia: {
          indigo: '#4B0082',
          'indigo-light': '#6B21A8',
          orange: '#FF9B00',
          'orange-light': '#FFAB2E',
          cream: '#F0EEE9',
          'cream-dark': '#E5E2DB',
          lavender: '#B2A5FF',
          'lavender-light': '#C9BFFF',
          black: '#0D0E0E',
          'gray-dark': '#1A1B1C',
          'gray': '#2D2E2F',
          'gray-light': '#4A4B4C',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.15)',
          heavy: 'rgba(255, 255, 255, 0.25)',
        }
      },
      fontFamily: {
        'display': ['Zain', 'sans-serif'],
        'body': ['Merriweather', 'serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'gradient': 'gradient 15s ease infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(75, 0, 130, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(75, 0, 130, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
