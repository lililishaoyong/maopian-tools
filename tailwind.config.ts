import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effdf8",
          100: "#d8f8ee",
          200: "#b9efe2",
          500: "#8ae5d6",
          600: "#55cdbd",
          700: "#279889"
        },
        coral: {
          50: "#fff0f0",
          100: "#ffe0e2",
          500: "#ff8c91",
          600: "#f46f78"
        },
        cream: {
          50: "#fffdf9",
          100: "#fff6e9",
          200: "#f5e6d4",
          500: "#9a705a",
          900: "#2b211d"
        }
      },
      boxShadow: {
        soft: "0 12px 40px rgba(120, 76, 45, 0.08)",
        card: "0 10px 28px rgba(154, 112, 90, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
