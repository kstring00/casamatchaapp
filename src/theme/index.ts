import { Platform } from "react-native";

export const colors = {
  forest: "#1F3A2B",
  forest2: "#2C513C",
  forest3: "#12261B",
  cream: "#F3ECDD",
  foam: "#FFF9EE",
  paper: "#E7D5B6",
  kraft: "#C9A876",
  gold: "#B9893F",
  goldLight: "#E7C988",
  caramel: "#B96935",
  ink: "#172019",
  muted: "#6F756F",
  border: "rgba(31,58,43,0.14)",
  danger: "#9D3C32",
  white: "#FFFFFF",
  overlay: "rgba(23,32,25,0.46)"
} as const;

export const radius = {
  xs: 10,
  sm: 14,
  md: 20,
  lg: 28,
  pill: 999
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
} as const;

export const fonts = {
  display: Platform.select({ ios: "Georgia-Bold", android: "serif", default: "serif" }),
  displayRegular: Platform.select({ ios: "Georgia", android: "serif", default: "serif" }),
  body: Platform.select({ ios: "Avenir Next", android: "sans-serif", default: "system-ui" }),
  bodyMedium: Platform.select({ ios: "Avenir Next Demi Bold", android: "sans-serif-medium", default: "system-ui" }),
  script: Platform.select({ ios: "Snell Roundhand", android: "cursive", default: "cursive" })
} as const;

export const shadow = {
  card: {
    shadowColor: "#102016",
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 4
  },
  float: {
    shadowColor: "#102016",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8
  }
} as const;

export const type = {
  displayXL: { fontFamily: fonts.display, fontSize: 42, lineHeight: 43, letterSpacing: -1.5 },
  displayL: { fontFamily: fonts.display, fontSize: 34, lineHeight: 36, letterSpacing: -1.1 },
  displayM: { fontFamily: fonts.display, fontSize: 27, lineHeight: 30, letterSpacing: -0.7 },
  title: { fontFamily: fonts.bodyMedium, fontSize: 18, lineHeight: 23 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  bodySmall: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 14, letterSpacing: 1.8, textTransform: "uppercase" as const }
} as const;
