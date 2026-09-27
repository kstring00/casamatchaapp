import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius, spacing, type } from "@/theme";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return <View accessibilityRole="progressbar" style={styles.wrap}><ActivityIndicator color={colors.forest} /><Text allowFontScaling style={styles.body}>{label}</Text></View>;
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <View accessibilityRole="alert" style={styles.card}>
      <Text allowFontScaling style={styles.title}>Something went sideways.</Text>
      <Text allowFontScaling style={styles.body}>{message}</Text>
      {retry ? <Pressable accessibilityRole="button" onPress={retry} style={styles.button}><Text allowFontScaling style={styles.buttonText}>Try again</Text></Pressable> : null}
    </View>
  );
}
export function EmptyState({ title, body }: { title: string; body: string }) {
  return <View style={styles.card}><Text allowFontScaling style={styles.title}>{title}</Text><Text allowFontScaling style={styles.body}>{body}</Text></View>;
}
const styles = StyleSheet.create({
  wrap: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  card: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.foam, padding: spacing.lg, gap: spacing.sm },
  title: { ...type.title, color: colors.forest },
  body: { ...type.bodySmall, color: colors.muted },
  button: { marginTop: spacing.xs, minHeight: 44, alignSelf: "flex-start", justifyContent: "center", borderRadius: radius.pill, paddingHorizontal: spacing.md, backgroundColor: colors.forest },
  buttonText: { fontFamily: fonts.bodyMedium, color: colors.cream, fontSize: 14 }
});
