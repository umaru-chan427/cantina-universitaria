/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f3f8fc',
        brand: {
          50: '#eff8ff',
          100: '#dceffe',
          400: '#38a4e8',
          500: '#1e8fdd',
          600: '#1273c2',
          700: '#0f5c9c',
        },
        accent: {
          yellow: '#ffd54a',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
