import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#1E3A8A", dark: "#16306F", 50: "#EEF3FC" },
        gold: { DEFAULT: "#CA8A04", light: "#EAB308", soft: "#FEF6E0" },
        ink: "#0F172A",
        muted: "#64748B",
        line: "#E7ECF3",
        canvas: "#F5F7FB",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
