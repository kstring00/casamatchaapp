import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { Eyebrow, PillButton, Sparkle, Wordmark } from "@/components/Brand";
import { LocationToggle } from "@/components/LocationToggle";
import { featuredEvent as mockEvent, seasonalFeature as mockSeasonal } from "@/data/mock";
import { getFeaturedEvent, getSeasonalFeature } from "@/content/service";
import { useAsync } from "@/lib/useAsync";
import { commerceProvider } from "@/providers";
import { useAppState } from "@/state/AppState";
import { colors, fonts, radius, shadow, spacing, type } from "@/theme";

const heroImage = "https://casa-matcha.vercel.app/hero/still-splash.png"; // VERIFY

export default function HomeScreen() {
  const { locationId } = useAppState();
  const seasonalState = useAsync(getSeasonalFeature, []);
  const eventState = useAsync(getFeaturedEvent, []);
  const seasonal = seasonalState.data ?? mockSeasonal;
  const event = eventState.data ?? mockEvent;

  const orderAhead = async () => {
    const url = await commerceProvider.getOrderHandoffUrl(locationId);
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: colors.forest
    });
  };

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Wordmark />
          <Pressable
            onPress={() => router.push("/inbox")}
            accessibilityRole="button"
            accessibilityLabel="Open notification inbox"
            style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.forest} />
          </Pressable>
        </View>
        <LocationToggle />
      </View>

      <View style={styles.hero}>
        <Image
          source={{ uri: heroImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="center"
          transition={250}
          accessibilityLabel="Iced matcha drink splashing over the cup"
        />
        <LinearGradient
          colors={["rgba(243,236,221,0.98)", "rgba(243,236,221,0.78)", "rgba(243,236,221,0.08)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroCopy}>
          <View style={styles.eyebrowRow}>
            <Sparkle size={11} />
            <Eyebrow>Good drinks · brighter people</Eyebrow>
          </View>
          <Text allowFontScaling style={styles.heroTitle}>
            Real matcha.{"\n"}Real coffee.{"\n"}Real familia.
          </Text>
          <View style={styles.heroCtas}>
            <PillButton label="Order ahead  →" onPress={orderAhead} />
            <Pressable
              onPress={() => router.push("/menu")}
              accessibilityRole="button"
              accessibilityLabel="Explore menu"
              style={({ pressed }) => [styles.textLinkWrap, pressed && { opacity: 0.68 }]}
            >
              <Text allowFontScaling style={styles.textLink}>Explore menu</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={colors.forest} />
            </Pressable>
          </View>
        </View>
      </View>

      {seasonalState.error || eventState.error ? (
        <View accessibilityRole="alert" style={styles.savedNotice}>
          <MaterialCommunityIcons name="cloud-off-outline" size={16} color={colors.forest} />
          <Text allowFontScaling style={styles.savedNoticeText}>Live updates unavailable · showing saved Casa content.</Text>
        </View>
      ) : null}

      <FeatureCard
        eyebrow={seasonal.eyebrow}
        title={seasonal.title}
        caption={seasonal.caption}
        image={seasonal.image}
        onPress={() => router.push("/menu?category=Seasonal")}
        accessibilityLabel={"View the seasonal " + seasonal.title}
        tone="paper"
      />

      <FeatureCard
        eyebrow="Featured event"
        title={event.title}
        caption={event.dateLabel + " · Casa Matcha " + (event.locationId === "webster" ? "Webster" : "Friendswood")}
        image={event.image}
        onPress={() => router.push("/community?section=events")}
        accessibilityLabel={"Open featured event " + event.title}
        tone="dark"
      />

      <View style={styles.closingNote}>
        <Sparkle size={12} color={colors.gold} />
        <Text allowFontScaling style={styles.script}>Houston made · familia fueled</Text>
        <Sparkle size={12} color={colors.gold} />
      </View>
    </AppScreen>
  );
}

function FeatureCard({
  eyebrow,
  title,
  caption,
  image,
  onPress,
  accessibilityLabel,
  tone
}: {
  eyebrow: string;
  title: string;
  caption: string;
  image: string;
  onPress: () => void;
  accessibilityLabel: string;
  tone: "paper" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.feature, dark && styles.featureDark, pressed && { transform: [{ scale: 0.992 }] }]}
    >
      <View style={styles.featureCopy}>
        <Text allowFontScaling style={[styles.featureEyebrow, dark && { color: colors.goldLight }]}>
          {eyebrow.toUpperCase()}
        </Text>
        <Text allowFontScaling style={[styles.featureTitle, dark && { color: colors.cream }]}>{title}</Text>
        <Text allowFontScaling style={[styles.featureCaption, dark && { color: "rgba(243,236,221,0.78)" }]}>{caption}</Text>
        <View style={[styles.arrowCircle, dark && { backgroundColor: colors.forest2 }]}>
          <MaterialCommunityIcons name="arrow-right" size={20} color={dark ? colors.cream : colors.forest} />
        </View>
      </View>
      <Image
        source={{ uri: image }}
        style={styles.featureImage}
        contentFit="cover"
        transition={200}
        accessibilityLabel={title}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, paddingTop: spacing.xs },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(31,58,43,0.06)" },
  hero: { minHeight: 430, borderRadius: 30, overflow: "hidden", backgroundColor: colors.paper, ...shadow.card },
  heroCopy: { width: "68%", minHeight: 430, padding: spacing.lg, justifyContent: "center", gap: spacing.md },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroTitle: { ...type.displayXL, color: colors.forest, maxWidth: 250 },
  heroCtas: { gap: spacing.md, alignItems: "flex-start" },
  textLinkWrap: { minHeight: 44, flexDirection: "row", gap: 8, alignItems: "center", paddingHorizontal: 6 },
  textLink: { fontFamily: fonts.bodyMedium, color: colors.forest, fontSize: 15, textDecorationLine: "underline", textDecorationColor: colors.gold },
  savedNotice: { minHeight: 44, borderRadius: radius.md, backgroundColor: "rgba(31,58,43,0.06)", paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.xs },
  savedNoticeText: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.forest },
  feature: { minHeight: 184, flexDirection: "row", overflow: "hidden", borderRadius: radius.lg, backgroundColor: colors.paper, ...shadow.card },
  featureDark: { backgroundColor: colors.ink },
  featureCopy: { flex: 1.1, padding: spacing.lg, justifyContent: "center", gap: 8 },
  featureEyebrow: { ...type.label, color: colors.forest },
  featureTitle: { ...type.displayM, color: colors.forest },
  featureCaption: { ...type.bodySmall, color: colors.muted },
  featureImage: { width: "38%", minHeight: 184 },
  arrowCircle: { marginTop: 4, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.foam },
  closingNote: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  script: { fontFamily: fonts.script, fontSize: 20, color: colors.forest }
});
