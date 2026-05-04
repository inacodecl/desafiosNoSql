/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          900: "#042f2e",
        },
        cyber: {
          bg:    "#020c1b",
          card:  "#0a1628",
          border:"#1e3a5f",
          glow:  "#00d4ff",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "glow-pulse":  "glowPulse 2s ease-in-out infinite",
        "scan-line":   "scanLine 3s linear infinite",
        "float":       "float 6s ease-in-out infinite",
        "matrix-fall": "matrixFall 10s linear infinite",
        "border-flow": "borderFlow 3s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 8px #00d4ff44" },
          "50%":     { boxShadow: "0 0 24px #00d4ff88, 0 0 48px #00d4ff33" },
        },
        scanLine: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-10px)" },
        },
        matrixFall: {
          "0%":   { transform: "translateY(-100%)", opacity: "1" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        borderFlow: {
          "0%":   { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
    },
  },
  plugins: [],
};