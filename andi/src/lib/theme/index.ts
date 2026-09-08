// Design tokens for عندي. Premium-minimal: one confident brand green, warm
// neutrals, generous rounding, soft shadows — deliberately not a saturated
// "marketplace primary blue" look.

export const colors = {
  brand: "#0F5132",
  brandDark: "#0B3D26",
  brandLight: "#E7F3EC",
  accent: "#F2A65A",
  bg: "#FAFAF8",
  surface: "#FFFFFF",
  border: "#ECEAE4",
  text: "#1C1C1E",
  textMuted: "#6B6B70",
  textFaint: "#A3A3A8",
  success: "#1E8E5A",
  warning: "#C77A1F",
  danger: "#D14343",
  overlay: "rgba(0,0,0,0.45)",
  white: "#FFFFFF",
  starFilled: "#F2B705",
} as const;

export const statusColors: Record<string, string> = {
  pending: colors.warning,
  accepted: colors.brand,
  rejected: colors.danger,
  ready_for_pickup: "#3E7CB1",
  active: "#3E7CB1",
  returned: "#6B6B70",
  completed: colors.success,
  cancelled: colors.danger,
  available: colors.success,
  rented: colors.warning,
  paused: colors.textFaint,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: "700" as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.text },
  bodyBold: { fontSize: 15, fontWeight: "600" as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: "400" as const, color: colors.textMuted },
  small: { fontSize: 11, fontWeight: "500" as const, color: colors.textFaint },
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};
