import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { colors, fonts, radius, spacing, type } from "@/theme";

export default function PrivacyScreen() {
  const openWebPolicy = () => WebBrowser.openBrowserAsync("https://casa-matcha.vercel.app/privacy");

  return (
    <AppScreen>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <MaterialCommunityIcons name="arrow-left" size={23} color={colors.forest} />
        </Pressable>
        <View>
          <Text allowFontScaling style={styles.title}>Privacy</Text>
          <Text allowFontScaling style={styles.kicker}>PLAIN LANGUAGE</Text>
        </View>
      </View>

      <Policy title="What stays on your phone">
        Your selected location, favorites, demo cart, notification preferences, and one-time prompt flags are stored locally on your device.
      </Policy>
      <Policy title="What is stored when you enable push">
        Your Expo push token, platform, selected Casa, and the topics and locations you opt into are stored in Supabase so Casa Matcha can target the updates you requested.
      </Policy>
      <Policy title="Ordering and payment">
        Phase 1 does not process payments or submit native orders. Order Ahead and Checkout hand off to Toast Online Ordering. Toast handles the information you provide there under its own policies.
      </Policy>
      <Policy title="Maps and external links">
        Directions open Apple Maps or Google Maps. Tickets and Instagram open external services. The app does not request continuous device location in Phase 1.
      </Policy>

      <Pressable accessibilityRole="link" accessibilityLabel="Open web privacy policy" onPress={openWebPolicy} style={styles.link}>
        <Text allowFontScaling style={styles.linkText}>Open web privacy policy</Text>
        <MaterialCommunityIcons name="arrow-top-right" size={19} color={colors.forest} />
      </Pressable>
    </AppScreen>
  );
}

function Policy({ title, children }: { title: string; children: string }) {
  return (
    <View style={styles.card}>
      <Text allowFontScaling style={styles.cardTitle}>{title}</Text>
      <Text allowFontScaling style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingTop: spacing.xs },
  back: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(31,58,43,0.06)" },
  title: { ...type.displayM, color: colors.forest },
  kicker: { ...type.label, color: colors.gold, marginTop: 3 },
  card: { borderRadius: radius.md, backgroundColor: colors.foam, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.xs },
  cardTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.forest },
  body: { ...type.bodySmall, color: colors.muted },
  link: { minHeight: 52, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.forest, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  linkText: { fontFamily: fonts.bodyMedium, color: colors.forest, fontSize: 14 }
});
