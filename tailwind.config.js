/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bsi-primary': '#1e88e5',
        'bsi-secondary': '#43a047',
        'bsi-accent': '#fb8c00',
        'bsi-danger': '#e53935',
        'bsi-warning': '#fdd835',
      },
    },
  },
  plugins: [],
}
