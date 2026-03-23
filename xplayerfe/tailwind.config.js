/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Taverna de Inverno palette
        taverna: {
          deep:     "#0d1a0f",
          surface:  "#142418",
          elevated: "#1e3322",
          accent:   "#2d6a4f",
          bright:   "#52b788",
        },
        beige: {
          light: "#f5ebe0",
          warm:  "#e9d8a6",
          muted: "#c9b99a",
        },
        // Keep jungle/moss for backward compatibility
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
      fontFamily: {
        display: ["Cinzel", "serif"],
        body:    ["Crimson Pro", "serif"],
        mono:    ["JetBrains Mono", "monospace"],
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
          "0%, 100%": { boxShadow: "0 0 8px oklch(0.68 0.22 280 / 20%)" },
          "50%":       { boxShadow: "0 0 20px oklch(0.68 0.22 280 / 50%)" },
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
        "stagger-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "canhoes-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-6px)" },
        },
        "canhoes-pulse": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(82, 183, 136, 0.20)" },
          "50%":       { boxShadow: "0 0 24px rgba(82, 183, 136, 0.38), 0 0 8px rgba(82, 183, 136, 0.25)" },
        },
        "canhoes-card-enter": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "canhoes-modal-enter": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        "canhoes-letter-reveal": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in":             "fade-in 0.18s ease-out",
        "slide-up":            "slide-up 0.2s ease-out",
        "slide-in-bottom":     "slide-in-bottom 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        "glow-pulse":          "glow-pulse 2.5s ease-in-out infinite",
        "ambient-float":       "ambient-float 3s ease-in-out infinite",
        "xp-count":            "xp-count 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        "nav-indicator":       "nav-indicator 0.2s ease-out",
        "stagger-in":          "stagger-in 0.25s ease-out both",
        "canhoes-float":       "canhoes-float 3s ease-in-out infinite",
        "canhoes-pulse":       "canhoes-pulse 2.6s ease-in-out infinite",
        "canhoes-card-enter":  "canhoes-card-enter 0.35s ease-out both",
        "canhoes-modal-enter": "canhoes-modal-enter 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
        "canhoes-letter":      "canhoes-letter-reveal 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
