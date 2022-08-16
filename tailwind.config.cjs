/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*.{svelte,js}"],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ["light"]
  }
}
