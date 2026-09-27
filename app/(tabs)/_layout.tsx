import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, View, type ColorValue } from "react-native";
import { AstronautBadge } from "@/components/Brand";
import { useAppState } from "@/state/AppState";
import { commerceProvider } from "@/providers";
import { colors, fonts, shadow } from "@/theme";

function Icon({ name, color, size }: { name: keyof typeof MaterialCommunityIcons.glyphMap; color: ColorValue; size: number }) {
  return <MaterialCommunityIcons name={name} color={color} size={size} />;
}

function OrderButton() {
  const { locationId } = useAppState();
  const open = async () => {
    const url = await commerceProvider.getOrderHandoffUrl(locationId);
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: colors.forest
    });
  };
  return (
    <View style={styles.orderSlot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Order ahead"
        onPress={open}
        style={({ pressed }) => [styles.orderButton, pressed && { transform: [{ scale: 0.96 }] }]}
      >
        <AstronautBadge size={58} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: "#747A73",
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 10, marginTop: 2 },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        sceneStyle: { backgroundColor: colors.cream }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Icon name="home-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="menu" options={{ title: "Menu", tabBarIcon: ({ color, size }) => <Icon name="silverware-fork-knife" color={color} size={size} /> }} />
      <Tabs.Screen name="order" options={{ title: "", tabBarButton: () => <OrderButton /> }} />
      <Tabs.Screen name="rewards" options={{ title: "Rewards", tabBarIcon: ({ color, size }) => <Icon name="star-four-points-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="community" options={{ title: "Community", tabBarIcon: ({ color, size }) => <Icon name="account-group-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute", left: 12, right: 12, bottom: 10, height: 82, paddingTop: 8, paddingBottom: 9,
    borderTopWidth: 0, borderRadius: 26, backgroundColor: colors.foam, ...shadow.float
  },
  tabItem: { minHeight: 58 },
  orderSlot: { flex: 1, alignItems: "center", justifyContent: "center" },
  orderButton: {
    width: 72, height: 72, marginTop: -26, alignItems: "center", justifyContent: "center", borderRadius: 36,
    backgroundColor: colors.cream, ...shadow.float
  }
});
