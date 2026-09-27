import type { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Casa Matcha",
  slug: "casa-matcha",
  scheme: "casamatcha",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  backgroundColor: "#F3ECDD",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.casamatcha.app"
  },
  android: {
    package: "com.casamatcha.app",
    adaptiveIcon: {
      backgroundColor: "#F3ECDD"
    }
  },
  web: {
    bundler: "metro"
  },
  plugins: [
    "expo-router",
    [
      "expo-notifications",
      {
        "defaultChannel": "casa-updates",
        "color": "#1F3A2B"
      }
    ]
  ],
  extra: {
    commerceProvider: process.env.COMMERCE_PROVIDER ?? "mock",
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? ""
    }
  }
});
