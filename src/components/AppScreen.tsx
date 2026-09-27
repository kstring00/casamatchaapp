import { type PropsWithChildren, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";
import { OfflineBanner } from "./OfflineBanner";

export function AppScreen({
  children,
  scroll = true,
  header
}: PropsWithChildren<{ scroll?: boolean; header?: ReactNode }>) {
  const body = (
    <View style={styles.inner}>
      {header}
      {children}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <OfflineBanner />
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {body}
        </ScrollView>
      ) : (
        <View style={styles.content}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  scroll: { flex: 1 },
  content: { flexGrow: 1, paddingBottom: 128 },
  inner: { width: "100%", paddingHorizontal: spacing.md, gap: spacing.lg }
});
