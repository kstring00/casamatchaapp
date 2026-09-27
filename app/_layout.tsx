import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppStateProvider } from "@/state/AppState";
import { colors } from "@/theme";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" backgroundColor={colors.cream} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.cream },
            animation: "fade_from_bottom"
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="inbox" />
          <Stack.Screen name="notification-preferences" />
          <Stack.Screen name="about" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="menu-item/[id]" options={{ presentation: "modal" }} />
        </Stack>
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
