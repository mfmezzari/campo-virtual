/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: "#f3f8f4",
          100: "#e3f0e6",
          200: "#c3e0cb",
          300: "#93c7a4",
          400: "#5eaa78",
          500: "#3b8d58",
          600: "#2b7146",
          700: "#215838",
          800: "#173d28",
          900: "#10281b",
        },
        ink: {
          900: "#14211b",
          700: "#2d3d34",
          500: "#5d6d64",
          300: "#93a199",
        },
        sun: {
          100: "#fff4d6",
          400: "#f0b429",
          500: "#e09a16",
          700: "#8a5a08",
        },
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 12px 28px -18px rgba(16, 40, 27, 0.55)",
        frame: "0 30px 80px -30px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};
