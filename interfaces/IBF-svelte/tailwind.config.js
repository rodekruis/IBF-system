/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#2c45fd',
        secondary: '#1976d2', 
        warning: '#ff9800',
        danger: '#f44336',
        success: '#4caf50',
        'ibf-blue': '#2c45fd',
        'ibf-red': '#e53e3e',
        'ibf-yellow': '#ecc94b',
        'ibf-green': '#38a169'
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
  // Optimize for smaller bundle size
  corePlugins: {
    preflight: true,
    container: false,
    accessibility: false,
    backgroundOpacity: false,
    borderOpacity: false,
    boxShadow: false,
    divideOpacity: false,
    placeholderOpacity: false,
    ringOpacity: false,
    textOpacity: false
  }
};
