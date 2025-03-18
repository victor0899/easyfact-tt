/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B262C",
        secondary: "#0F4C75",
        tertiary: "#3282B8",
        quaternary: "#BBE1FA",
      }
    },
  },
  plugins: [],
}