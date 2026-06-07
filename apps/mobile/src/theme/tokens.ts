// Dizayn tokenlari — JS tomonda (gradient, soya, ikonka rangi uchun).
// Tailwind config bilan bir xil qadriyatlar.

export const colors = {
  primary: "#1E3A8A",
  primaryDark: "#16306F",
  primary900: "#0B1A3D",
  gold: "#CA8A04",
  goldLight: "#EAB308",
  goldSoft: "#FEF6E0",
  ink: "#0F172A",
  muted: "#64748B",
  subtle: "#94A3B8",
  line: "#E7ECF3",
  surface: "#FFFFFF",
  canvas: "#F5F7FB",
  success: "#0E9F6E",
  danger: "#E11D48",
  star: "#F59E0B",
  white: "#FFFFFF",
} as const;

// Premium gradientlar (expo-linear-gradient uchun)
export const gradients = {
  primary: ["#1E3A8A", "#16306F"] as const,
  hero: ["#16306F", "#1E3A8A", "#2A4DA8"] as const,
  gold: ["#EAB308", "#CA8A04"] as const,
  // Rasm ustidagi qoraytirish (matn o'qilishi uchun)
  imageScrim: ["transparent", "rgba(11,26,61,0.05)", "rgba(11,26,61,0.85)"] as const,
};

export const shadow = {
  card: {
    shadowColor: "#0B1A3D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  soft: {
    shadowColor: "#0B1A3D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lifted: {
    shadowColor: "#0B1A3D",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const font = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
} as const;
