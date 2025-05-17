/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#e6d719",
        secondary: "#ffffff",
        blackYellow: "#d3c517",

      },
      fontFamily: {
        regular: "Roboto-400Regular",
        medium: "Roboto-500Medium",
        bold: "Roboto-700Bold",
      },
    },
  },
  plugins: [],
}