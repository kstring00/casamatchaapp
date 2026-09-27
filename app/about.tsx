import Constants from "expo-constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AstronautBadge, Sparkle, Wordmark } from "@/components/Brand";
import { sendLocalDemoNotification } from "@/notifications/client";
import { colors, fonts, radius, spacing, type } from "@/theme";

export default function AboutScreen() {
  const [demoUnlocked, setDemoUnlocked] = useState(false);
  const taps = useRef(0);
  const year = new Date().getFullYear();

  const unlock = () => {
    taps.current += 1;
    if (taps.current >= 5) setDemoUnlocked(true);
  };

  return (
    <AppScreen>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={23} color={colors.forest} />
        </Pressable>
        <Wordmark compact />
      </View>

      <View style={styles.hero}>
        <AstronautBadge size={112} />
        <Sparkle size={18} />
        <Text allowFontScaling style={styles.title}>Same planet.{"\n"}Better drinks.</Text>
        <Text allowFontScaling style={styles.body}>A native Casa Matcha app concept built around ordering, rewards, seasonal drops, events, and the two Casa communities.</Text>
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="App version" onPress={unlock} style={styles.info}>
        <Text allowFontScaling style={styles.infoTitle}>Casa Matcha</Text>
        <Text allowFontScaling style={styles.infoText}>Version {Constants.expoConfig?.version ?? "1.0.0"} · © {year} Casa Matcha</Text>
      </Pressable>

      {demoUnlocked ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Send test notification" onPress={() => sendLocalDemoNotification().catch(() => {})} style={styles.demoButton}>
          <MaterialCommunityIcons name="bell-ring-outline" size={20} color={colors.cream} />
          <Text allowFontScaling style={styles.demoText}>Send test notification</Text>
        </Pressable>
      ) : null}

      <Pressable accessibilityRole="link" accessibilityLabel="Privacy policy" onPress={() => router.push("/privacy")} style={styles.link}>
        <Text allowFontScaling style={styles.linkText}>Privacy policy</Text>
        <MaterialCommunityIcons name="chevron-right" size={21} color={colors.forest} />
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingTop: spacing.xs },
  back: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(31,58,43,0.06)" },
  hero: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.md },
  title: { ...type.displayL, color: colors.forest, textAlign: "center" },
  body: { ...type.body, color: colors.muted, textAlign: "center", maxWidth: 340 },
  info: { minHeight: 78, borderRadius: radius.md, backgroundColor: colors.foam, borderWidth: 1, borderColor: colors.border, padding: spacing.md, justifyContent: "center" },
  infoTitle: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  infoText: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 3 },
  demoButton: { minHeight: 52, borderRadius: radius.pill, backgroundColor: colors.forest, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  demoText: { fontFamily: fonts.bodyMedium, color: colors.cream, fontSize: 14 },
  link: { minHeight: 52, borderRadius: radius.md, backgroundColor: colors.foam, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md },
  linkText: { fontFamily: fonts.bodyMedium, color: colors.forest, fontSize: 14 }
});
