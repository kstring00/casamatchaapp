import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { Sparkle, Wordmark } from "@/components/Brand";
import { LocationToggle } from "@/components/LocationToggle";
import { featuredEvent as mockEvent, seasonalFeature as mockSeasonal } from "@/data/mock";
import { getFeaturedEvent, getSeasonalFeature } from "@/content/service";
import { useAsync } from "@/lib/useAsync";
import { commerceProvider } from "@/providers";
import { useAppState } from "@/state/AppState";
import { colors, fonts, radius, shadow, spacing, type } from "@/theme";

const heroImage = "https://casa-matcha.vercel.app/hero/still-splash.png"; // VERIFY
const secondaryImage = "https://casa-matcha.vercel.app/menu/strawberry-matcha.jpg"; // VERIFY

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
      <View style={styles.masthead}>
        <View style={styles.mastheadBrand}>
          <Wordmark />
          <Text allowFontScaling style={styles.mastheadSub}>MATCHA · COFFEE · CULTURA</Text>
        </View>

        <Pressable
          onPress={() => router.push("/inbox")}
          accessibilityRole="button"
          accessibilityLabel="Open notification inbox"
          style={({ pressed }) => [styles.bellButton, pressed && { opacity: 0.7 }]}
        >
          <MaterialCommunityIcons name="bell-outline" size={21} color={colors.forest} />
          <View style={styles.bellDot} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Image
          source={{ uri: heroImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="center"
          transition={220}
          accessibilityLabel="Iced matcha splashing above a Casa Matcha cup"
        />
        <LinearGradient
          colors={[
            "rgba(18,38,27,0.03)",
            "rgba(18,38,27,0.08)",
            "rgba(18,38,27,0.64)",
            "rgba(18,38,27,0.94)"
          ]}
          locations={[0, 0.42, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.heroTopMeta}>
          <View style={styles.heroNumber}>
            <Text allowFontScaling style={styles.heroNumberText}>01</Text>
            <View style={styles.heroNumberRule} />
            <Text allowFontScaling style={styles.heroNumberText}>03</Text>
          </View>
          <View style={styles.heroTopRight}>
            <Text allowFontScaling style={styles.heroMicro}>HOUSTON AREA</Text>
            <Text allowFontScaling style={styles.heroMicro}>EST. IN FAMILIA</Text>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <View style={styles.heroEyebrow}>
            <Sparkle size={11} color={colors.goldLight} />
            <Text allowFontScaling style={styles.heroEyebrowText}>GOOD DRINKS · BRIGHTER PEOPLE</Text>
          </View>

          <Text allowFontScaling style={styles.heroTitle}>
            Real matcha.
            {"\n"}Real coffee.
            {"\n"}Real <Text style={styles.heroTitleAccent}>familia.</Text>
          </Text>

          <Text allowFontScaling style={styles.heroBody}>
            Whisked fresh, pulled with care, and made for the people around the table.
          </Text>

          <View style={styles.heroActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Order ahead"
              onPress={orderAhead}
              style={({ pressed }) => [styles.orderButton, pressed && styles.pressedButton]}
            >
              <View style={styles.orderButtonIcon}>
                <MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.forest} />
              </View>
              <View style={styles.orderButtonCopy}>
                <Text allowFontScaling style={styles.orderButtonLabel}>ORDER AHEAD</Text>
                <Text allowFontScaling style={styles.orderButtonMeta}>
                  {locationId === "friendswood" ? "Friendswood" : "Webster"}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push("/menu")}
              accessibilityRole="button"
              accessibilityLabel="Explore menu"
              style={({ pressed }) => [styles.menuLink, pressed && { opacity: 0.68 }]}
            >
              <Text allowFontScaling style={styles.menuLinkText}>Explore the menu</Text>
              <MaterialCommunityIcons name="arrow-right" size={17} color={colors.cream} />
            </Pressable>
          </View>
        </View>

        <View style={styles.locationDock}>
          <Text allowFontScaling style={styles.locationDockLabel}>YOUR CASA</Text>
          <LocationToggle />
        </View>
      </View>

      {seasonalState.error || eventState.error ? (
        <View accessibilityRole="alert" style={styles.savedNotice}>
          <MaterialCommunityIcons name="cloud-off-outline" size={16} color={colors.forest} />
          <Text allowFontScaling style={styles.savedNoticeText}>Live updates unavailable · showing saved Casa content.</Text>
        </View>
      ) : null}

      <View style={styles.manifesto}>
        <View style={styles.manifestoMark}>
          <Text accessible={false} style={styles.manifestoStar}>✦</Text>
        </View>
        <View style={styles.manifestoCopy}>
          <Text allowFontScaling style={styles.manifestoEyebrow}>THE CASA WAY</Text>
          <Text allowFontScaling style={styles.manifestoTitle}>
            Not just a coffee run.
            {"\n"}A place to <Text style={styles.manifestoItalic}>land.</Text>
          </Text>
        </View>
        <Text allowFontScaling style={styles.manifestoSide}>TWO CASAS · ONE FAMILIA</Text>
      </View>

      <View style={styles.editorialGrid}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"View the seasonal " + seasonal.title}
          onPress={() => router.push("/menu?category=Seasonal")}
          style={({ pressed }) => [styles.seasonalCard, pressed && styles.cardPressed]}
        >
          <Image
            source={{ uri: seasonal.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={180}
            accessibilityLabel={seasonal.title}
          />
          <LinearGradient
            colors={["rgba(18,38,27,0.04)", "rgba(18,38,27,0.82)"]}
            locations={[0.32, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.seasonalIndex}>
            <Text allowFontScaling style={styles.seasonalIndexText}>DROP / 01</Text>
          </View>
          <View style={styles.seasonalCopy}>
            <Text allowFontScaling style={styles.seasonalEyebrow}>{seasonal.eyebrow.toUpperCase()}</Text>
            <Text allowFontScaling style={styles.seasonalTitle}>{seasonal.title}</Text>
            <Text allowFontScaling style={styles.seasonalCaption}>{seasonal.caption}</Text>
            <View style={styles.seasonalArrow}>
              <MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.cream} />
            </View>
          </View>
        </Pressable>

        <View style={styles.sideRail}>
          <View style={styles.tasteCard}>
            <Image
              source={{ uri: secondaryImage }}
              style={styles.tasteImage}
              contentFit="cover"
              accessibilityLabel="Strawberry matcha"
            />
            <View style={styles.tasteCopy}>
              <Text allowFontScaling style={styles.tasteEyebrow}>WHISKED DAILY</Text>
              <Text allowFontScaling style={styles.tasteTitle}>Ceremonial matcha, without the ceremony.</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={"Open featured event " + event.title}
            onPress={() => router.push("/community?section=events")}
            style={({ pressed }) => [styles.eventTicket, pressed && styles.cardPressed]}
          >
            <View style={styles.eventTicketTop}>
              <Text allowFontScaling style={styles.eventTicketLabel}>CASA NIGHTS</Text>
              <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color={colors.goldLight} />
            </View>
            <Text allowFontScaling style={styles.eventTicketTitle}>{event.title}</Text>
            <Text allowFontScaling style={styles.eventTicketMeta}>
              {event.dateLabel}
              {"\n"}Casa Matcha {event.locationId === "webster" ? "Webster" : "Friendswood"}
            </Text>
            <View style={styles.ticketRule} />
            <View style={styles.ticketBottom}>
              <Text allowFontScaling style={styles.ticketSerial}>CM · 0026</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={colors.cream} />
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.closingStatement}>
        <Text allowFontScaling style={styles.closingTop}>MATCHA FOR THE PEOPLE</Text>
        <Text allowFontScaling style={styles.closingTitle}>
          Come for the drink.
          {"\n"}Stay for the <Text style={styles.closingAccent}>energy.</Text>
        </Text>
        <View style={styles.closingMeta}>
          <Text allowFontScaling style={styles.closingMetaText}>FRIENDSWOOD</Text>
          <View style={styles.closingRule} />
          <Text allowFontScaling style={styles.closingMetaText}>WEBSTER</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  masthead: {
    paddingTop: spacing.xs,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  mastheadBrand: { gap: 8 },
  mastheadSub: {
    ...type.label,
    fontSize: 9,
    letterSpacing: 1.45,
    color: colors.gold
  },
  bellButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,249,238,0.66)"
  },
  bellDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.caramel
  },

  hero: {
    minHeight: 592,
    borderRadius: 34,
    overflow: "hidden",
    backgroundColor: colors.forest3,
    ...shadow.float
  },
  heroTopMeta: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  heroNumber: { flexDirection: "row", alignItems: "center", gap: 7 },
  heroNumberText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    color: "rgba(255,249,238,0.84)"
  },
  heroNumberRule: { width: 24, height: 1, backgroundColor: "rgba(255,249,238,0.48)" },
  heroTopRight: { alignItems: "flex-end", gap: 3 },
  heroMicro: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.35,
    color: "rgba(255,249,238,0.78)"
  },
  heroCopy: {
    minHeight: 592,
    paddingHorizontal: 22,
    paddingTop: 112,
    paddingBottom: 108,
    justifyContent: "flex-end",
    gap: 16
  },
  heroEyebrow: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroEyebrowText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.55,
    color: colors.goldLight
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 47,
    letterSpacing: -2.1,
    color: colors.cream,
    maxWidth: 315
  },
  heroTitleAccent: {
    fontFamily: fonts.displayRegular,
    fontStyle: "italic",
    color: colors.goldLight
  },
  heroBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(243,236,221,0.78)",
    maxWidth: 280
  },
  heroActions: { gap: 13, alignItems: "flex-start" },
  orderButton: {
    minHeight: 58,
    borderRadius: radius.pill,
    paddingLeft: 8,
    paddingRight: 20,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadow.card
  },
  pressedButton: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  orderButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldLight
  },
  orderButtonCopy: { gap: 1 },
  orderButtonLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 1.25,
    color: colors.forest
  },
  orderButtonMeta: { fontFamily: fonts.body, fontSize: 11, color: colors.muted },
  menuLink: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 4
  },
  menuLinkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.cream,
    textDecorationLine: "underline",
    textDecorationColor: "rgba(243,236,221,0.45)"
  },
  locationDock: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    padding: 8,
    borderRadius: 24,
    backgroundColor: "rgba(255,249,238,0.94)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.58)"
  },
  locationDockLabel: {
    ...type.label,
    fontSize: 8,
    letterSpacing: 1.35,
    color: colors.gold,
    marginLeft: 10,
    marginBottom: 4
  },

  savedNotice: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: "rgba(31,58,43,0.06)",
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  savedNoticeText: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: colors.forest },

  manifesto: {
    minHeight: 184,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "stretch",
    gap: spacing.md
  },
  manifestoMark: {
    width: 48,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 9
  },
  manifestoStar: { color: colors.gold, fontSize: 28 },
  manifestoCopy: { flex: 1, justifyContent: "center", gap: 10 },
  manifestoEyebrow: { ...type.label, color: colors.gold },
  manifestoTitle: {
    fontFamily: fonts.display,
    fontSize: 33,
    lineHeight: 34,
    letterSpacing: -1.1,
    color: colors.forest
  },
  manifestoItalic: {
    fontFamily: fonts.displayRegular,
    fontStyle: "italic",
    color: colors.caramel
  },
  manifestoSide: {
    width: 20,
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.25,
    color: colors.muted,
    transform: [{ rotate: "90deg" }],
    alignSelf: "center"
  },

  editorialGrid: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch"
  },
  seasonalCard: {
    flex: 1.16,
    minHeight: 418,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: colors.forest,
    ...shadow.card
  },
  seasonalIndex: {
    position: "absolute",
    top: 16,
    left: 16,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,249,238,0.9)"
  },
  seasonalIndexText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.1,
    color: colors.forest
  },
  seasonalCopy: {
    flex: 1,
    padding: 18,
    justifyContent: "flex-end",
    gap: 7
  },
  seasonalEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.4,
    color: colors.goldLight
  },
  seasonalTitle: {
    fontFamily: fonts.display,
    fontSize: 31,
    lineHeight: 31,
    letterSpacing: -1.05,
    color: colors.cream
  },
  seasonalCaption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(243,236,221,0.76)"
  },
  seasonalArrow: {
    marginTop: 3,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(243,236,221,0.3)"
  },
  sideRail: { flex: 0.84, gap: 12 },
  tasteCard: {
    minHeight: 202,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border
  },
  tasteImage: { width: "100%", height: 104 },
  tasteCopy: { padding: 13, gap: 6 },
  tasteEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.25,
    color: colors.gold
  },
  tasteTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 19,
    letterSpacing: -0.35,
    color: colors.forest
  },
  eventTicket: {
    flex: 1,
    minHeight: 204,
    borderRadius: 26,
    padding: 15,
    backgroundColor: colors.forest3,
    justifyContent: "space-between",
    overflow: "hidden",
    ...shadow.card
  },
  eventTicketTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eventTicketLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.goldLight
  },
  eventTicketTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 21,
    letterSpacing: -0.55,
    color: colors.cream
  },
  eventTicketMeta: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    color: "rgba(243,236,221,0.68)"
  },
  ticketRule: {
    borderStyle: "dashed",
    borderTopWidth: 1,
    borderColor: "rgba(243,236,221,0.22)"
  },
  ticketBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ticketSerial: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.25,
    color: "rgba(243,236,221,0.62)"
  },
  cardPressed: { transform: [{ scale: 0.988 }], opacity: 0.94 },

  closingStatement: {
    minHeight: 220,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  closingTop: { ...type.label, color: colors.gold },
  closingTitle: {
    fontFamily: fonts.display,
    fontSize: 37,
    lineHeight: 38,
    letterSpacing: -1.3,
    color: colors.forest,
    textAlign: "center"
  },
  closingAccent: {
    fontFamily: fonts.displayRegular,
    fontStyle: "italic",
    color: colors.caramel
  },
  closingMeta: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 10 },
  closingMetaText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.25,
    color: colors.muted
  },
  closingRule: { width: 30, height: 1, backgroundColor: colors.gold }
});
