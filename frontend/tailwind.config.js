export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Playfair Display', 'serif']
      },
      boxShadow: {
        glow: '0 18px 45px rgba(10, 45, 40, 0.28)'
      }
    }
  },
  plugins: []
};
