/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        saffron: { 400: '#FF9933', 500: '#FF8000', 600: '#E67300' },
        navy: { 700: '#1a2744', 800: '#0f1d3d', 900: '#080f20' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
};
