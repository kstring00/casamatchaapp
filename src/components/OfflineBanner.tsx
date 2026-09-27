import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(
    () =>
      NetInfo.addEventListener((state) => {
        setOffline(state.isConnected === false);
      }),
    []
  );
  if (!offline) return null;
  return (
    <View accessibilityRole="alert" style={styles.wrap}>
      <Text allowFontScaling style={styles.text}>Offline · showing saved demo content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.ink, paddingVertical: 7, paddingHorizontal: 16 },
  text: {
    color: colors.cream,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    textAlign: "center"
  }
});
