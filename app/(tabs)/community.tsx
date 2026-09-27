import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useEffect, useMemo, useState } from "react";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState";
import { featuredEvent as mockEvent, story } from "@/data/mock";
import { getFeaturedEvent, type EventContent } from "@/content/service";
import { commerceProvider } from "@/providers";
import { colors, fonts, radius, shadow, spacing, type } from "@/theme";
import type { CafeLocation } from "@/types/commerce";
import { useAsync } from "@/lib/useAsync";

type Section = "locations" | "events" | "story";

const sections: { id: Section; label: string; number: string }[] = [
  { id: "locations", label: "Locations", number: "01" },
  { id: "events", label: "Events", number: "02" },
  { id: "story", label: "Our Story", number: "03" }
];

export default function CommunityScreen() {
  const params = useLocalSearchParams<{ section?: string }>();
  const initial = sections.some((item) => item.id === params.section)
    ? (params.section as Section)
    : "locations";
  const [section, setSection] = useState<Section>(initial);
  const { data: locations, loading, error, retry } = useAsync(
    () => commerceProvider.getLocations(),
    []
  );
  const eventState = useAsync(getFeaturedEvent, []);
  const event = eventState.data ?? mockEvent;

  useEffect(() => {
    if (params.section && sections.some((item) => item.id === params.section)) {
      setSection(params.section as Section);
    }
  }, [params.section]);

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.headerMeta}>
          <Text allowFontScaling style={styles.edition}>CASA FIELD NOTES · 01</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="About Casa Matcha app"
            onPress={() => router.push("/about")}
            style={styles.infoButton}
          >
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.forest} />
          </Pressable>
        </View>

        <Text allowFontScaling style={styles.title}>
          Community
          <Text style={styles.titleDot}>.</Text>
        </Text>
        <Text allowFontScaling style={styles.kicker}>MATCHA · PEOPLE · CULTURA</Text>
      </View>

      <View style={styles.segmentRail} accessibilityRole="tablist">
        {sections.map((item) => {
          const active = section === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={"Show " + item.label}
              onPress={() => setSection(item.id)}
              style={({ pressed }) => [styles.segment, pressed && { opacity: 0.68 }]}
            >
              <Text allowFontScaling={false} style={[styles.segmentNumber, active && styles.segmentNumberActive]}>
                {item.number}
              </Text>
              <Text allowFontScaling style={[styles.segmentText, active && styles.segmentTextActive]}>
                {item.label}
              </Text>
              <View style={[styles.segmentRule, active && styles.segmentRuleActive]} />
            </Pressable>
          );
        })}
      </View>

      {section === "locations" ? (
        loading ? (
          <LoadingState label="Finding both shops…" />
        ) : error ? (
          <ErrorState message={error.message} retry={retry} />
        ) : !locations?.length ? (
          <EmptyState title="Locations are unavailable." body="Try again when you are back online." />
        ) : (
          <LocationsSection locations={locations} />
        )
      ) : null}

      {section === "events" ? (
        <>
          {eventState.error ? (
            <ErrorState
              message="Live event updates are unavailable. Showing saved event content."
              retry={eventState.retry}
            />
          ) : null}
          <EventsSection event={event} />
        </>
      ) : null}

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
        <MapView
          style={StyleSheet.absoluteFill}
          initialRegion={center}
          accessibilityLabel="Map showing Casa Matcha Friendswood and Webster"
        >
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

        <View pointerEvents="none" style={styles.mapStamp}>
          <Text allowFontScaling style={styles.mapStampTop}>TWO CASAS</Text>
          <Text allowFontScaling style={styles.mapStampBottom}>ONE FAMILIA</Text>
        </View>
      </View>

      <View style={styles.locationIntro}>
        <Text allowFontScaling style={styles.sectionEyebrow}>FIND YOUR CASA</Text>
        <Text allowFontScaling style={styles.locationIntroTitle}>
          Same energy.
          {"\n"}Different corner.
        </Text>
      </View>

      <View style={styles.locationGrid}>
        {locations.map((location, index) => (
          <LocationCard key={location.id} location={location} index={index + 1} />
        ))}
      </View>
    </View>
  );
}

function LocationCard({ location, index }: { location: CafeLocation; index: number }) {
  const directions = async () => {
    const encoded = encodeURIComponent(
      location.address1 + ", " + location.city + ", " + location.state + " " + location.zip
    );
    const url =
      Platform.OS === "ios"
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
      <View style={styles.locationNumber}>
        <Text allowFontScaling={false} style={styles.locationNumberText}>
          0{index}
        </Text>
      </View>

      <View style={styles.locationCopy}>
        <Text allowFontScaling style={styles.locationName}>{location.name}</Text>
        <Text allowFontScaling style={styles.address}>
          {location.address1}
          {"\n"}
          {location.city}, {location.state} {location.zip}
        </Text>
        <Text allowFontScaling style={styles.hours}>{location.hoursSummary}</Text>
      </View>

      <View style={styles.locationActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"Call Casa Matcha " + location.name}
          onPress={call}
          style={styles.roundAction}
        >
          <MaterialCommunityIcons name="phone-outline" size={18} color={colors.forest} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"Get directions to Casa Matcha " + location.name}
          onPress={directions}
          style={styles.directionAction}
        >
          <Text allowFontScaling style={styles.directionText}>Directions</Text>
          <MaterialCommunityIcons name="arrow-top-right" size={17} color={colors.cream} />
        </Pressable>
      </View>
    </View>
  );
}

function EventsSection({ event }: { event: EventContent }) {
  const tickets = () =>
    WebBrowser.openBrowserAsync(event.ticketUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: colors.forest
    });

  const locationName = event.locationId === "webster" ? "Webster" : "Friendswood";
  const date = event.date ? new Date(event.date) : null;
  const month =
    date && !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat("en-US", { month: "short" }).format(date).toUpperCase()
      : "OCT";
  const day = date && !Number.isNaN(date.getTime()) ? String(date.getDate()) : "26";

  return (
    <View style={styles.sectionStack}>
      <View style={styles.eventPoster}>
        <Image
          source={{ uri: event.image }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityLabel="Casa Matcha event"
        />
        <LinearGradient
          colors={["rgba(18,38,27,0.04)", "rgba(18,38,27,0.2)", "rgba(18,38,27,0.94)"]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.posterDate}>
          <Text allowFontScaling style={styles.posterMonth}>{month}</Text>
          <Text allowFontScaling style={styles.posterDay}>{day}</Text>
        </View>

        <View style={styles.posterCopy}>
          <Text allowFontScaling style={styles.posterEyebrow}>CASA NIGHTS · FEATURED</Text>
          <Text allowFontScaling style={styles.posterTitle}>{event.title}</Text>
          <Text allowFontScaling style={styles.posterMeta}>
            {event.dateLabel} · Casa Matcha {locationName}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={"Get tickets for " + event.title}
            onPress={tickets}
            style={({ pressed }) => [styles.ticketButton, pressed && { transform: [{ scale: 0.985 }] }]}
          >
            <View>
              <Text allowFontScaling style={styles.ticketEyebrow}>RESERVE YOUR SPOT</Text>
              <Text allowFontScaling style={styles.ticketText}>Get tickets</Text>
            </View>
            <View style={styles.ticketArrow}>
              <MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.forest} />
            </View>
          </Pressable>
        </View>
      </View>

      <View style={styles.eventNote}>
        <Text allowFontScaling style={styles.eventNoteNumber}>02</Text>
        <View style={styles.eventNoteCopy}>
          <Text allowFontScaling style={styles.eventNoteEyebrow}>WHY WE DO IT</Text>
          <Text allowFontScaling style={styles.eventNoteTitle}>
            Drinks are better when something is happening around them.
          </Text>
        </View>
      </View>
    </View>
  );
}

function StorySection() {
  const openInstagram = () =>
    WebBrowser.openBrowserAsync("https://www.instagram.com/casamatchahtx/", {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: colors.forest
    });

  return (
    <View style={styles.sectionStack}>
      <View style={styles.storyHero}>
        <Image
          source={{ uri: story.ownerImage }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityLabel="Casa Matcha owner"
        />
        <LinearGradient
          colors={["rgba(18,38,27,0.02)", "rgba(18,38,27,0.72)"]}
          locations={[0.46, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.storyImageCopy}>
          <Text allowFontScaling style={styles.storyImageEyebrow}>MORE THAN DRINKS</Text>
          <Text allowFontScaling style={styles.storyImageTitle}>Built for the people who stay a while.</Text>
        </View>
      </View>

      <View style={styles.storyEditorial}>
        <View style={styles.storyIndex}>
          <Text allowFontScaling={false} style={styles.storyIndexText}>03</Text>
        </View>
        <View style={styles.storyCopy}>
          <Text allowFontScaling style={styles.storyTitle}>{story.title}</Text>
          <Text allowFontScaling style={styles.storyBody}>{story.body}</Text>
          <Text allowFontScaling style={styles.script}>familia first, always.</Text>
        </View>
      </View>

      <View style={styles.quoteCard}>
        <MaterialCommunityIcons name="format-quote-open" size={24} color={colors.gold} />
        <Text allowFontScaling style={styles.quote}>“{story.testimonial}”</Text>
        <Text allowFontScaling style={styles.quoteBy}>— {story.testimonialBy}</Text>
      </View>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Open Casa Matcha on Instagram"
        onPress={openInstagram}
        style={({ pressed }) => [styles.instagram, pressed && { opacity: 0.9 }]}
      >
        <View>
          <Text allowFontScaling style={styles.instagramEyebrow}>FOLLOW THE CASA</Text>
          <Text allowFontScaling style={styles.instagramText}>{story.instagram}</Text>
        </View>
        <View style={styles.instagramIcon}>
          <MaterialCommunityIcons name="instagram" size={21} color={colors.forest} />
        </View>
      </Pressable>

      <View style={styles.legalLinks}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="About the app"
          onPress={() => router.push("/about")}
          style={styles.legalLink}
        >
          <Text style={styles.legalText}>About</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Privacy policy"
          onPress={() => router.push("/privacy")}
          style={styles.legalLink}
        >
          <Text style={styles.legalText}>Privacy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xs, gap: 8 },
  headerMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  edition: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.muted
  },
  infoButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,249,238,0.52)"
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 50,
    lineHeight: 50,
    letterSpacing: -1.9,
    color: colors.forest
  },
  titleDot: { color: colors.caramel },
  kicker: { ...type.label, color: colors.gold },

  segmentRail: {
    minHeight: 62,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15
  },
  segment: {
    flex: 1,
    minHeight: 58,
    justifyContent: "flex-end",
    gap: 4
  },
  segmentNumber: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.0,
    color: "#A0A49E"
  },
  segmentNumberActive: { color: colors.gold },
  segmentText: {
    fontFamily: fonts.displayRegular,
    fontSize: 17,
    color: "#949993"
  },
  segmentTextActive: { color: colors.forest },
  segmentRule: {
    height: 1,
    marginTop: 3,
    backgroundColor: "rgba(31,58,43,0.12)"
  },
  segmentRuleActive: { height: 2, backgroundColor: colors.forest },

  sectionStack: { gap: spacing.lg },

  mapFrame: {
    height: 310,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: colors.paper,
    ...shadow.float
  },
  mapStamp: {
    position: "absolute",
    left: 14,
    bottom: 14,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: "rgba(18,38,27,0.9)"
  },
  mapStampTop: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.3,
    color: colors.goldLight
  },
  mapStampBottom: {
    marginTop: 2,
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.cream
  },
  locationIntro: { gap: 6 },
  sectionEyebrow: {
    ...type.label,
    fontSize: 8,
    letterSpacing: 1.25,
    color: colors.gold
  },
  locationIntroTitle: {
    fontFamily: fonts.display,
    fontSize: 31,
    lineHeight: 32,
    letterSpacing: -0.9,
    color: colors.forest
  },
  locationGrid: { gap: 12 },
  locationCard: {
    minHeight: 190,
    padding: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,249,238,0.62)",
    ...shadow.card
  },
  locationNumber: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper
  },
  locationNumberText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.0,
    color: colors.gold
  },
  locationCopy: { paddingRight: 42, gap: 7 },
  locationName: {
    fontFamily: fonts.display,
    fontSize: 29,
    lineHeight: 30,
    color: colors.forest
  },
  address: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink
  },
  hours: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: colors.muted
  },
  locationActions: {
    marginTop: "auto",
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  roundAction: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border
  },
  directionAction: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    backgroundColor: colors.forest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  directionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.cream
  },

  eventPoster: {
    minHeight: 520,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: colors.forest3,
    ...shadow.float
  },
  posterDate: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 70,
    height: 78,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,249,238,0.94)"
  },
  posterMonth: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.25,
    color: colors.gold
  },
  posterDay: {
    fontFamily: fonts.display,
    fontSize: 33,
    lineHeight: 34,
    color: colors.forest
  },
  posterCopy: {
    flex: 1,
    minHeight: 520,
    padding: 22,
    justifyContent: "flex-end",
    gap: 9
  },
  posterEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.35,
    color: colors.goldLight
  },
  posterTitle: {
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 41,
    letterSpacing: -1.45,
    color: colors.cream,
    maxWidth: 320
  },
  posterMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: "rgba(243,236,221,0.72)"
  },
  ticketButton: {
    minHeight: 66,
    marginTop: 4,
    borderRadius: 22,
    paddingHorizontal: 15,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  ticketEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 7.5,
    letterSpacing: 1.15,
    color: colors.gold
  },
  ticketText: {
    marginTop: 2,
    fontFamily: fonts.display,
    fontSize: 23,
    color: colors.forest
  },
  ticketArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldLight
  },
  eventNote: {
    minHeight: 140,
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start"
  },
  eventNoteNumber: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 46,
    color: colors.paper
  },
  eventNoteCopy: { flex: 1, gap: 5, paddingTop: 7 },
  eventNoteEyebrow: {
    ...type.label,
    fontSize: 8,
    color: colors.gold
  },
  eventNoteTitle: {
    fontFamily: fonts.displayRegular,
    fontSize: 24,
    lineHeight: 28,
    color: colors.forest
  },

  storyHero: {
    height: 430,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: colors.paper,
    ...shadow.float
  },
  storyImageCopy: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
    gap: 6
  },
  storyImageEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8.5,
    letterSpacing: 1.3,
    color: colors.goldLight
  },
  storyImageTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 34,
    letterSpacing: -1.0,
    color: colors.cream
  },
  storyEditorial: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16
  },
  storyIndex: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper
  },
  storyIndexText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.0,
    color: colors.gold
  },
  storyCopy: { flex: 1, gap: 10 },
  storyTitle: {
    fontFamily: fonts.display,
    fontSize: 31,
    lineHeight: 32,
    letterSpacing: -0.9,
    color: colors.forest
  },
  storyBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink
  },
  script: {
    fontFamily: fonts.script,
    fontSize: 24,
    color: colors.caramel
  },
  quoteCard: {
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
    paddingLeft: 18,
    paddingVertical: 8,
    gap: 7
  },
  quote: {
    fontFamily: fonts.displayRegular,
    fontSize: 25,
    lineHeight: 31,
    color: colors.forest
  },
  quoteBy: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.muted
  },
  instagram: {
    minHeight: 78,
    borderRadius: 24,
    paddingHorizontal: 18,
    backgroundColor: colors.forest3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  instagramEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.goldLight
  },
  instagramText: {
    marginTop: 3,
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.cream
  },
  instagramIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldLight
  },
  legalLinks: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center"
  },
  legalLink: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  legalText: {
    fontFamily: fonts.bodyMedium,
    color: colors.forest,
    fontSize: 12,
    textDecorationLine: "underline"
  }
});
