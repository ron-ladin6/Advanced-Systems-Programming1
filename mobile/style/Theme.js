const palette = {
  primary: "#6366F1",
  primaryLight: "#818CF8",
  accent: "#14B8A6",

  //backgrounds
  white: "#FFFFFF",
  offWhite: "#F8FAFC",
  darkSlate: "#0F172A",
  lightSlate: "#1E293B",

  //text
  textMain: "#1E293B",
  textLight: "#F1F5F9",
  textMuted: "#94A3B8",

  // status
  danger: "#EF4444",
  success: "#10B981",
};

export const LightTheme = {
  dark: false,
  colors: {
    bg: palette.offWhite,
    card: palette.white,
    text: palette.textMain,
    muted: palette.textMuted,
    primary: palette.primary,
    border: "#E2E8F0",
    danger: palette.danger,
    inputBg: palette.white,
  },
  spacing: { s: 8, m: 16, l: 24, xl: 32 },
  radius: { m: 12, l: 20, circle: 50 },
  font: { small: 12, body: 16, title: 24, header: 32 },
};

export const DarkTheme = {
  dark: true,
  colors: {
    bg: palette.darkSlate,
    card: palette.lightSlate,
    text: palette.textLight,
    muted: palette.textMuted,
    primary: palette.primaryLight,
    border: "#334155",
    danger: palette.danger,
    inputBg: palette.lightSlate,
  },
  spacing: { s: 8, m: 16, l: 24, xl: 32 },
  radius: { m: 12, l: 20, circle: 50 },
  font: { small: 12, body: 16, title: 24, header: 32 },
};
