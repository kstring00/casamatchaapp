import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View, type ColorValue } from "react-native";
import { AstronautBadge } from "@/components/Brand";
import { useAppState } from "@/state/AppState";
import { commerceProvider } from "@/providers";
import { colors, fonts, shadow } from "@/theme";

function Icon({
  name,
  color,
  size
}: {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  color: ColorValue;
  size: number;
}) {
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
        style={({ pressed }) => [
          styles.orderButton,
          pressed && { transform: [{ scale: 0.965 }], opacity: 0.94 }
        ]}
      >
        <View style={styles.orderOrbit}>
          <AstronautBadge size={49} />
        </View>
        <Text allowFontScaling={false} style={styles.orderLabel}>ORDER</Text>
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
        tabBarInactiveTintColor: "#7D827D",
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIcon,
        sceneStyle: { backgroundColor: colors.cream }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Icon name="home-outline" color={color} size={size - 1} />
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => <Icon name="silverware-fork-knife" color={color} size={size - 1} />
        }}
      />
      <Tabs.Screen name="order" options={{ title: "", tabBarButton: () => <OrderButton /> }} />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, size }) => <Icon name="star-four-points-outline" color={color} size={size - 1} />
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarIcon: ({ color, size }) => <Icon name="account-group-outline" color={color} size={size - 1} />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    height: 78,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: "rgba(31,58,43,0.11)",
    borderRadius: 29,
    backgroundColor: "rgba(255,249,238,0.98)",
    ...shadow.float
  },
  tabItem: {
    minHeight: 56,
    paddingHorizontal: 1
  },
  tabIcon: {
    marginTop: 1
  },
  tabLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.65,
    textTransform: "uppercase",
    marginTop: 2
  },
  orderSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  orderButton: {
    width: 78,
    height: 78,
    marginTop: -27,
    borderRadius: 39,
    backgroundColor: colors.forest3,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.float
  },
  orderOrbit: {
    width: 55,
    height: 55,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: "rgba(231,201,136,0.48)"
  },
  orderLabel: {
    position: "absolute",
    bottom: 3,
    fontFamily: fonts.bodyMedium,
    fontSize: 7,
    letterSpacing: 1.25,
    color: colors.goldLight
  }
});
