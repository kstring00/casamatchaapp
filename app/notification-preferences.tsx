import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { syncSavedPushPreferences } from "@/notifications/client";
import { useAppState, type NotificationPrefs } from "@/state/AppState";
import { colors, fonts, radius, spacing, type } from "@/theme";

export default function NotificationPreferencesScreen() {
  const { notificationPrefs, setNotificationPrefs, locationId } = useAppState();

  const update = (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(next);
    syncSavedPushPreferences(locationId, next).catch(() => {});
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={styles.iconButton}>
          <MaterialCommunityIcons name="arrow-left" size={23} color={colors.forest} />
        </Pressable>
        <View>
          <Text allowFontScaling style={styles.title}>Notifications</Text>
          <Text allowFontScaling style={styles.kicker}>YOU PICK THE VIBE</Text>
        </View>
      </View>

      <Text allowFontScaling style={styles.intro}>Choose what Casa Matcha can send you. Remote push is tested in a development build; Expo Go keeps the local demo notification available.</Text>

      <View style={styles.group}>
        <Text allowFontScaling style={styles.groupTitle}>Topics</Text>
        <Toggle label="Events" description="DJ nights and community happenings" value={notificationPrefs.events} onValueChange={(v) => update("events", v)} />
        <Toggle label="Seasonal drops" description="Limited matcha, coffee and bakery drops" value={notificationPrefs.seasonal} onValueChange={(v) => update("seasonal", v)} />
        <Toggle label="Rewards" description="Reward news and loyalty reminders" value={notificationPrefs.rewards} onValueChange={(v) => update("rewards", v)} />
      </View>

      <View style={styles.group}>
        <Text allowFontScaling style={styles.groupTitle}>Locations</Text>
        <Toggle label="Friendswood" description="Updates specific to Friendswood" value={notificationPrefs.friendswood} onValueChange={(v) => update("friendswood", v)} />
        <Toggle label="Webster" description="Updates specific to Webster" value={notificationPrefs.webster} onValueChange={(v) => update("webster", v)} />
      </View>
    </AppScreen>
  );
}

function Toggle({ label, description, value, onValueChange }: { label: string; description: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text allowFontScaling style={styles.label}>{label}</Text>
        <Text allowFontScaling style={styles.description}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#C8C4B9", true: colors.forest2 }}
        thumbColor={value ? colors.goldLight : colors.foam}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingTop: spacing.xs },
  iconButton: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(31,58,43,0.06)" },
  title: { ...type.displayM, color: colors.forest },
  kicker: { ...type.label, color: colors.gold, marginTop: 3 },
  intro: { ...type.body, color: colors.muted },
  group: { borderRadius: radius.lg, backgroundColor: colors.foam, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  groupTitle: { ...type.label, color: colors.gold, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: 6 },
  row: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  label: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink },
  description: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: colors.muted, marginTop: 2 }
});
