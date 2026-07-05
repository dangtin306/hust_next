/** @type {import('tailwindcss').Config} */
const pluginCapsize = require("tailwindcss-capsize");

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [pluginCapsize],
};
