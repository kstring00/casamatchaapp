import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
import { colors } from "@/theme";
import { supabase } from "@/lib/supabase";
import type { LocationId } from "@/types/commerce";
import type { NotificationPrefs } from "@/state/AppState";

const SOFT_PROMPT_KEY = "casa-matcha:notifications:soft-prompt:v1";
const PUSH_TOKEN_KEY = "casa-matcha:notifications:expo-token:v1";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export async function configureNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("casa-updates", {
      name: "Casa Matcha updates",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: colors.forest
    });
  }
}

export async function maybePromptNotifications(
  locationId: LocationId,
  prefs: NotificationPrefs,
  trigger: "location" | "favorite"
) {
  if (Platform.OS === "web") return;
  const shown = await AsyncStorage.getItem(SOFT_PROMPT_KEY);
  if (shown) return;
  await AsyncStorage.setItem(SOFT_PROMPT_KEY, "shown");

  const title = trigger === "favorite" ? "Want first dibs on drops?" : "Get updates from your Casa?";
  const message =
    trigger === "favorite"
      ? "We can send seasonal drops, events and reward news — only when it is useful."
      : "Choose events, seasonal drops and rewards for Friendswood, Webster, or both.";

  Alert.alert(title, message, [
    { text: "Not now", style: "cancel" },
    {
      text: "Continue",
      onPress: () => {
        requestAndRegisterPush(locationId, prefs).catch(() => {});
      }
    }
  ]);
}

export async function requestAndRegisterPush(locationId: LocationId, prefs: NotificationPrefs) {
  const permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== "granted") return null;

  // Expo Go supports local notifications but remote push requires a development build.
  if (String(Constants.executionEnvironment) === "storeClient") return null;

  const configuredProjectId =
    Constants.easConfig?.projectId ||
    ((Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ?? "");
  if (!configuredProjectId) return null;

  const result = await Notifications.getExpoPushTokenAsync({ projectId: configuredProjectId });
  await AsyncStorage.setItem(PUSH_TOKEN_KEY, result.data);
  await savePushToken(result.data, locationId, prefs);
  return result.data;
}

async function savePushToken(token: string, locationId: LocationId, prefs: NotificationPrefs) {
  if (!supabase) return;
  const { error } = await supabase.functions.invoke("register-push", {
    body: {
      token,
      platform: Platform.OS,
      locationId,
      topics: {
        events: prefs.events,
        seasonal: prefs.seasonal,
        rewards: prefs.rewards
      },
      locationOptIns: {
        friendswood: prefs.friendswood,
        webster: prefs.webster
      }
    }
  });
  if (error) throw error;
}

export async function syncSavedPushPreferences(locationId: LocationId, prefs: NotificationPrefs) {
  const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  if (!token) return;
  await savePushToken(token, locationId, prefs);
}

export async function sendLocalDemoNotification() {
  await configureNotifications();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Pumpkin Drop just landed ✦",
      body: "Your Casa has something new. Tap to see the seasonal menu.",
      data: { route: "/menu?category=Seasonal" }
    },
    trigger: null
  });
}
