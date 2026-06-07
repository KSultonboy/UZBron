/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Asosiy — lyuks navy (hospitality/ishonch)
        primary: {
          DEFAULT: "#1E3A8A",
          50: "#EEF3FC",
          100: "#D9E3F7",
          500: "#2A4DA8",
          600: "#1E3A8A",
          700: "#16306F",
          800: "#102453",
          900: "#0B1A3D",
        },
        // Aksent — oltin (CTA, narx, reyting)
        gold: {
          DEFAULT: "#CA8A04",
          light: "#EAB308",
          soft: "#FEF6E0",
          600: "#CA8A04",
          700: "#A16207",
        },
        // Neytral
        ink: "#0F172A", // asosiy matn
        muted: "#64748B", // ikkilamchi matn
        subtle: "#94A3B8", // uchlamchi/placeholder
        line: "#E7ECF3", // chegara
        surface: "#FFFFFF", // kartochka
        canvas: "#F5F7FB", // sahifa foni
        // Status
        success: "#0E9F6E",
        danger: "#E11D48",
        star: "#F59E0B",
      },
      fontFamily: {
        sans: ["DMSans_400Regular"],
        "sans-medium": ["DMSans_500Medium"],
        "sans-semibold": ["DMSans_600SemiBold"],
        "sans-bold": ["DMSans_700Bold"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
    },
  },
  plugins: [],
};
