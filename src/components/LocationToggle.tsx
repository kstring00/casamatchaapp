import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppState } from "@/state/AppState";
import { colors, fonts, radius, spacing } from "@/theme";
import type { LocationId } from "@/types/commerce";

const options: { id: LocationId; label: string }[] = [
  { id: "friendswood", label: "Friendswood" },
  { id: "webster", label: "Webster" }
];

export function LocationToggle() {
  const { locationId, setLocationId } = useAppState();
  return (
    <View accessibilityRole="radiogroup" style={styles.wrap}>
      {options.map((option) => {
        const active = option.id === locationId;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={`Use ${option.label} location`}
            onPress={() => setLocationId(option.id)}
            style={({ pressed }) => [
              styles.option,
              active && styles.active,
              pressed && { opacity: 0.86 }
            ]}
          >
            <Text allowFontScaling style={[styles.text, active && styles.activeText]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 48,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: "rgba(31,58,43,0.06)",
    flexDirection: "row",
    gap: spacing.xs
  },
  option: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  active: { backgroundColor: colors.forest },
  text: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.forest },
  activeText: { color: colors.cream }
});
