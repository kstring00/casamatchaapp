import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, spacing, type } from "@/theme";

const astronaut = "https://casa-matcha.vercel.app/brand/logo.svg"; // VERIFY: replace with official mascot asset

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="Casa Matcha" style={styles.wordmark}>
      <Text allowFontScaling style={[styles.word, compact && styles.wordCompact]}>CASA</Text>
      <Text allowFontScaling style={[styles.word, compact && styles.wordCompact]}>MATCHA</Text>
    </View>
  );
}

export function Sparkle({ size = 14, color = colors.gold }: { size?: number; color?: string }) {
  return <Text accessible={false} style={{ fontSize: size, lineHeight: size + 2, color }}>✦</Text>;
}

export function Eyebrow({ children }: { children: string }) {
  return <Text allowFontScaling style={styles.eyebrow}>{children}</Text>;
}

export function AstronautBadge({ size = 54 }: { size?: number }) {
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={{ uri: astronaut }}
        style={{ width: size * 0.68, height: size * 0.68 }}
        contentFit="contain"
        accessibilityLabel="Casa Matcha astronaut mascot"
      />
    </View>
  );
}

export function PillButton({
  label,
  onPress,
  variant = "primary",
  accessibilityLabel
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "outline" && styles.outline,
        pressed && { opacity: 0.82 }
      ]}
    >
      <Text
        allowFontScaling
        style={[
          styles.buttonText,
          variant === "primary" ? { color: colors.cream } : { color: colors.forest }
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wordmark: { alignItems: "flex-start" },
  word: {
    fontFamily: fonts.display,
    color: colors.forest,
    fontSize: 26,
    lineHeight: 22,
    letterSpacing: -1
  },
  wordCompact: { fontSize: 20, lineHeight: 18 },
  eyebrow: {
    ...type.label,
    color: colors.forest,
    maxWidth: "100%"
  },
  badge: {
    backgroundColor: colors.foam,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  button: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  primary: { backgroundColor: colors.forest },
  secondary: { backgroundColor: colors.foam },
  outline: { borderWidth: 1, borderColor: colors.forest, backgroundColor: "transparent" },
  buttonText: { fontFamily: fonts.bodyMedium, fontSize: 15 }
});
