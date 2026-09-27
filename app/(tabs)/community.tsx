import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useMemo, useState } from "react";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState";
import { featuredEvent, story } from "@/data/mock";
import { commerceProvider } from "@/providers";
import { colors, fonts, radius, shadow, spacing, type } from "@/theme";
import type { CafeLocation } from "@/types/commerce";
import { useAsync } from "@/lib/useAsync";

type Section = "locations" | "events" | "story";

const sections: { id: Section; label: string }[] = [
  { id: "locations", label: "Locations" },
  { id: "events", label: "Events" },
  { id: "story", label: "Our Story" }
];

export default function CommunityScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const initial = sections.some((item) => item.id === params.section) ? (params.section as Section) : "locations";
  const [section, setSection] = useState<Section>(initial);
  const { data: locations, loading, error, retry } = useAsync(() => commerceProvider.getLocations(), []);

  useEffect(() => {
    if (params.section && sections.some((item) => item.id === params.section)) setSection(params.section as Section);
  }, [params.section]);

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text allowFontScaling style={styles.title}>Community</Text>
        <Text allowFontScaling style={styles.kicker}>MATCHA · PEOPLE · CULTURA</Text>
      </View>

      <View style={styles.segments}>
        {sections.map((item) => {
          const active = section === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={"Show " + item.label}
              onPress={() => setSection(item.id)}
              style={[styles.segment, active && styles.segmentActive]}
            >
              <Text allowFontScaling style={[styles.segmentText, active && styles.segmentTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {section === "locations" ? (
        loading ? <LoadingState label="Finding both shops…" /> :
        error ? <ErrorState message={error.message} retry={retry} /> :
        !locations?.length ? <EmptyState title="Locations are unavailable." body="Try again when you are back online." /> :
        <LocationsSection locations={locations} />
      ) : null}

      {section === "events" ? <EventsSection /> : null}
      {section === "story" ? <StorySection /> : null}
    </AppScreen>
  );
}

function LocationsSection({ locations }: { locations: CafeLocation[] }) {
  const center = useMemo(() => {
    const latitude = locations.reduce((sum, item) => sum + item.latitude, 0) / locations.length;
    const longitude = locations.reduce((sum, item) => sum + item.longitude, 0) / locations.length;
    return { latitude, longitude, latitudeDelta: 0.085, longitudeDelta: 0.085 };
  }, [locations]);

  return (
    <View style={styles.sectionStack}>
      <View style={styles.mapFrame}>
        <MapView style={StyleSheet.absoluteFillObject} initialRegion={center} accessibilityLabel="Map showing Casa Matcha Friendswood and Webster">
          {locations.map((location) => (
            <Marker
              key={location.id}
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title={"Casa Matcha " + location.name}
              description={location.address1}
              pinColor={colors.forest}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.locationGrid}>
        {locations.map((location) => <LocationCard key={location.id} location={location} />)}
      </View>
    </View>
  );
}

function LocationCard({ location }: { location: CafeLocation }) {
  const directions = async () => {
    const encoded = encodeURIComponent(location.address1 + ", " + location.city + ", " + location.state + " " + location.zip);
    const url = Platform.OS === "ios"
      ? "http://maps.apple.com/?daddr=" + encoded
      : "https://www.google.com/maps/dir/?api=1&destination=" + encoded;
    await Linking.openURL(url);
  };
  const call = async () => {
    const cleaned = location.phone.replace(/[^0-9+]/g, "");
    await Linking.openURL("tel:" + cleaned);
  };
  return (
    <View style={styles.locationCard}>
      <View style={styles.locationTop}>
        <View>
          <Text allowFontScaling style={styles.locationName}>{location.name}</Text>
          <Text allowFontScaling style={styles.address}>{location.address1}{"
"}{location.city}, {location.state} {location.zip}</Text>
        </View>
        <MaterialCommunityIcons name="map-marker-radius-outline" size={26} color={colors.gold} />
      </View>
      <Text allowFontScaling style={styles.hours}>{location.hoursSummary}</Text>
      <View style={styles.locationActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={"Call Casa Matcha " + location.name} onPress={call} style={styles.smallAction}>
          <MaterialCommunityIcons name="phone-outline" size={18} color={colors.forest} />
          <Text allowFontScaling style={styles.smallActionText}>Call</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={"Get directions to Casa Matcha " + location.name} onPress={directions} style={[styles.smallAction, styles.primarySmall]}>
          <MaterialCommunityIcons name="navigation-variant-outline" size={18} color={colors.cream} />
          <Text allowFontScaling style={[styles.smallActionText, { color: colors.cream }]}>Get directions</Text>
        </Pressable>
      </View>
    </View>
  );
}

function EventsSection() {
  const tickets = () => WebBrowser.openBrowserAsync(featuredEvent.ticketUrl, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: colors.forest
  });
  return (
    <View style={styles.sectionStack}>
      <View style={styles.eventCard}>
        <Image source={{ uri: featuredEvent.image }} style={StyleSheet.absoluteFillObject} contentFit="cover" accessibilityLabel="Casa Matcha event" />
        <View style={styles.eventShade} />
        <View style={styles.eventCopy}>
          <Text allowFontScaling style={styles.eventEyebrow}>FEATURED EVENT</Text>
          <Text allowFontScaling style={styles.eventTitle}>{featuredEvent.title}</Text>
          <Text allowFontScaling style={styles.eventMeta}>{featuredEvent.dateLabel} · Casa Matcha Webster</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Get tickets for Matcha Café y Perreo" onPress={tickets} style={styles.ticketButton}>
            <Text allowFontScaling style={styles.ticketText}>Get Tickets</Text>
            <MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.goldLight} />
          </Pressable>
        </View>
      </View>

      <View style={styles.listCard}>
        <Text allowFontScaling style={styles.sectionTitle}>Upcoming</Text>
        <View style={styles.eventRow}>
          <View style={styles.dateBadge}>
            <Text allowFontScaling style={styles.dateMonth}>OCT</Text>
            <Text allowFontScaling style={styles.dateDay}>26</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text allowFontScaling style={styles.rowEventTitle}>{featuredEvent.title}</Text>
            <Text allowFontScaling style={styles.rowEventMeta}>8 PM · Webster</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.forest} />
        </View>
      </View>
    </View>
  );
}

function StorySection() {
  const openInstagram = () => WebBrowser.openBrowserAsync("https://www.instagram.com/casamatchahtx/", {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: colors.forest
  });

  return (
    <View style={styles.sectionStack}>
      <View style={styles.storyHero}>
        <Image source={{ uri: story.ownerImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" accessibilityLabel="Casa Matcha owner" />
        <View style={styles.storyLabel}>
          <Text allowFontScaling style={styles.storyLabelText}>MORE THAN DRINKS</Text>
        </View>
      </View>

      <View style={styles.storyCopy}>
        <Text allowFontScaling style={styles.storyTitle}>{story.title}</Text>
        <Text allowFontScaling style={styles.storyBody}>{story.body}</Text>
        <Text allowFontScaling style={styles.script}>familia first, always.</Text>
      </View>

      <View style={styles.quoteCard}>
        <MaterialCommunityIcons name="format-quote-open" size={28} color={colors.gold} />
        <Text allowFontScaling style={styles.quote}>“{story.testimonial}”</Text>
        <Text allowFontScaling style={styles.quoteBy}>— {story.testimonialBy}</Text>
      </View>

      <Pressable accessibilityRole="link" accessibilityLabel="Open Casa Matcha on Instagram" onPress={openInstagram} style={styles.instagram}>
        <MaterialCommunityIcons name="instagram" size={22} color={colors.cream} />
        <Text allowFontScaling style={styles.instagramText}>{story.instagram}</Text>
        <MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.goldLight} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xs },
  title: { ...type.displayL, color: colors.forest },
  kicker: { ...type.label, color: colors.gold, marginTop: 6 },
  segments: { flexDirection: "row", minHeight: 48, borderRadius: radius.pill, backgroundColor: "rgba(31,58,43,0.07)", padding: 4, gap: 4 },
  segment: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radius.pill, paddingHorizontal: 8 },
  segmentActive: { backgroundColor: colors.forest },
  segmentText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.forest },
  segmentTextActive: { color: colors.cream },
  sectionStack: { gap: spacing.md },
  mapFrame: { height: 220, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.paper, ...shadow.card },
  locationGrid: { gap: spacing.sm },
  locationCard: { borderRadius: radius.md, backgroundColor: colors.foam, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm, ...shadow.card },
  locationTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: spacing.sm },
  locationName: { fontFamily: fonts.display, fontSize: 23, color: colors.forest },
  address: { ...type.bodySmall, color: colors.ink, marginTop: 5 },
  hours: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.muted },
  locationActions: { flexDirection: "row", gap: spacing.xs },
  smallAction: { minHeight: 46, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingHorizontal: spacing.md, backgroundColor: colors.cream },
  primarySmall: { flex: 1, backgroundColor: colors.forest, borderColor: colors.forest },
  smallActionText: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.forest },
  eventCard: { minHeight: 340, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.ink, ...shadow.card },
  eventShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(12,18,14,0.48)" },
  eventCopy: { flex: 1, minHeight: 340, padding: spacing.lg, justifyContent: "flex-end", gap: 9 },
  eventEyebrow: { ...type.label, color: colors.goldLight },
  eventTitle: { ...type.displayL, color: colors.cream, maxWidth: 300 },
  eventMeta: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.cream },
  ticketButton: { minHeight: 48, alignSelf: "flex-start", borderRadius: radius.pill, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: spacing.lg, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(31,58,43,0.88)" },
  ticketText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.cream },
  listCard: { borderRadius: radius.md, backgroundColor: colors.foam, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  sectionTitle: { ...type.title, color: colors.forest },
  eventRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dateBadge: { width: 54, height: 58, borderRadius: 16, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  dateMonth: { ...type.label, color: colors.goldLight, fontSize: 9 },
  dateDay: { fontFamily: fonts.display, fontSize: 24, color: colors.cream, lineHeight: 26 },
  rowEventTitle: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  rowEventMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 3 },
  storyHero: { height: 300, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.paper, ...shadow.card },
  storyLabel: { position: "absolute", left: 14, bottom: 14, borderRadius: radius.pill, backgroundColor: "rgba(31,58,43,0.88)", paddingHorizontal: 14, paddingVertical: 9 },
  storyLabelText: { ...type.label, color: colors.goldLight },
  storyCopy: { gap: spacing.sm },
  storyTitle: { ...type.displayL, color: colors.forest },
  storyBody: { ...type.body, color: colors.ink },
  script: { fontFamily: fonts.script, fontSize: 24, color: colors.gold, marginTop: 4 },
  quoteCard: { borderRadius: radius.lg, backgroundColor: colors.paper, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: "rgba(185,137,63,0.22)" },
  quote: { fontFamily: fonts.displayRegular, fontSize: 24, lineHeight: 31, color: colors.forest },
  quoteBy: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted },
  instagram: { minHeight: 54, borderRadius: radius.pill, backgroundColor: colors.forest, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, paddingHorizontal: spacing.lg },
  instagramText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.cream }
});
