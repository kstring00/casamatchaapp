import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { inboxSeed } from "@/data/mock";
import { colors, fonts, radius, spacing, type } from "@/theme";

export default function InboxScreen() {
  return (
    <AppScreen>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.iconButton}>
          <MaterialCommunityIcons name="arrow-left" size={23} color={colors.forest} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text allowFontScaling style={styles.title}>Inbox</Text>
          <Text allowFontScaling style={styles.kicker}>FROM YOUR CASA</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notification preferences" onPress={() => router.push("/notification-preferences")} style={styles.iconButton}>
          <MaterialCommunityIcons name="tune-variant" size={22} color={colors.forest} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {inboxSeed.map((message) => (
          <View key={message.id} style={styles.card}>
            <View style={styles.badge}><MaterialCommunityIcons name="star-four-points" size={16} color={colors.goldLight} /></View>
            <View style={{ flex: 1 }}>
              <Text allowFontScaling style={styles.messageTitle}>{message.title}</Text>
              <Text allowFontScaling style={styles.body}>{message.body}</Text>
              <Text allowFontScaling style={styles.topic}>{message.topic.toUpperCase()}</Text>
            </View>
          </View>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingTop: spacing.xs },
  iconButton: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(31,58,43,0.06)" },
  title: { ...type.displayM, color: colors.forest },
  kicker: { ...type.label, color: colors.gold, marginTop: 3 },
  list: { gap: spacing.sm },
  card: { minHeight: 112, borderRadius: radius.md, padding: spacing.md, backgroundColor: colors.foam, borderWidth: 1, borderColor: colors.border, flexDirection: "row", gap: spacing.sm },
  badge: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  messageTitle: { fontFamily: fonts.display, color: colors.forest, fontSize: 20, lineHeight: 23 },
  body: { ...type.bodySmall, color: colors.muted, marginTop: 4 },
  topic: { ...type.label, color: colors.gold, fontSize: 9, marginTop: 10 }
});
