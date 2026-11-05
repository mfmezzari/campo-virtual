/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#F4F5F0",
          100: "#E7EEDC",
          200: "#D3E2B8",
          300: "#B5CC86",
          400: "#85A947",
          500: "#6E9438",
          600: "#4F7330",
          700: "#2D5A27",
          800: "#1E3A2B",
          900: "#163024",
        },
        ink: {
          900: "#1F2937",
          700: "#374151",
          500: "#6B7280",
          300: "#9CA3AF",
        },
        sun: {
          100: "#FBF3DE",
          400: "#E5A93C",
          500: "#C9902A",
          700: "#8A6416",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 25, 23, 0.04)",
        frame: "0 16px 40px -28px rgba(28, 25, 23, 0.45)",
      },
    },
  },
  plugins: [],
};
