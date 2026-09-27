import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppStateProvider } from "@/state/AppState";
import { colors } from "@/theme";
import { configureNotifications } from "@/notifications/client";

export default function RootLayout() {
  useEffect(() => {
    configureNotifications().catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const route = response.notification.request.content.data?.route;
      if (typeof route === "string") router.push(route as never);
    });
    return () => sub.remove();
  }, []);

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
