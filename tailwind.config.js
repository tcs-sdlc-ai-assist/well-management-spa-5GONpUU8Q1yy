/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0c0a09',       // stone-950
          surface: '#1c1917',  // stone-900
          border: '#292524',   // stone-800
          accent: '#10b981',   // emerald-500
          link: '#2563eb',     // blue-600
        },
      },
    },
  },
  plugins: [],
};