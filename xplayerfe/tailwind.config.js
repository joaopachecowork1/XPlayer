/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        jungle: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        moss: {
          50:  "#f2f7f0",
          100: "#dfeedd",
          200: "#c0debb",
          300: "#93c58f",
          400: "#62a85c",
          500: "#408d3a",
          600: "#2e712a",
          700: "#255922",
          800: "#1e471c",
          900: "#193b18",
          950: "#0a200b",
        },
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "scale(0.96) translateY(4px)" },
          to:   { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-bottom": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 8px oklch(0.72 0.19 152 / 20%)" },
          "50%":       { boxShadow: "0 0 20px oklch(0.72 0.19 152 / 45%)" },
        },
        "ambient-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-4px)" },
        },
        "xp-count": {
          from: { opacity: "0", transform: "translateY(6px) scale(0.9)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "nav-indicator": {
          from: { transform: "scaleX(0)" },
          to:   { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-in":         "fade-in 0.18s ease-out",
        "slide-up":        "slide-up 0.2s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        "glow-pulse":      "glow-pulse 2.5s ease-in-out infinite",
        "ambient-float":   "ambient-float 3s ease-in-out infinite",
        "xp-count":        "xp-count 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        "nav-indicator":   "nav-indicator 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
