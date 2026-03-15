/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-green': '#2A3C2D',
        'purple': '#580695',
        'light-purple': '#900AF5',
        'dark-gray': '#868686',
        'gray': '#D9D9D9',
        'light-gray': '#F7F5EC',
        'black': '#1E1E1E',
        'yellow': '#D4AF37',
        'brand-blue': '#002455',
        'brand-blue-dark': '#050E3C',
        primary: {
          50: '#F7F5EC',
          100: '#E8E5D6',
          200: '#D9D9D9',
          300: '#868686',
          400: '#2A3C2D',
          500: '#580695',
          600: '#900AF5',
          700: '#D4AF37',
          800: '#1E1E1E',
          900: '#050E3C',
        },
      },
      fontFamily: {
        'dmsans': ['DMSans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        'playfair': ['Playfair', 'Times New Roman', 'Times', 'serif'],
      },
      letterSpacing: {
        'tighter': '-0.03em',
        'tight': '-0.01em',
        'normal': '0',
        'wide': '0.02em',
        'wider': '0.05em',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
