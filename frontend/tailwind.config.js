export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // rasgomedia.es brand identity — shared across all rasgomedia projects
        brand: {
          50: '#f0f6ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#4d94ff',
          500: '#0066ff',
          600: '#0056d6',
          700: '#0047b3',
          800: '#00398f',
          900: '#002966'
        },
        accent: {
          500: '#00c795',
          600: '#00a67c'
        }
      }
    }
  },
  plugins: []
};
