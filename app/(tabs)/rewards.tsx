import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AstronautBadge } from "@/components/Brand";
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState";
import { menuItems } from "@/data/mock";
import { commerceProvider } from "@/providers";
import { useAppState } from "@/state/AppState";
import { colors, fonts, radius, shadow, spacing, type } from "@/theme";
import { useAsync } from "@/lib/useAsync";

const providerName =
  ((Constants.expoConfig?.extra ?? {}) as { commerceProvider?: string }).commerceProvider ?? "mock";

export default function RewardsScreen() {
  const { locationId, cart, addToCart, updateQuantity } = useAppState();
  const { data, loading, error, retry } = useAsync(
    () => commerceProvider.getRewards("demo-user"),
    [locationId]
  );

  const subtotal = cart.reduce((sum, line) => {
    const item = menuItems.find((candidate) => candidate.id === line.itemId);
    return sum + (item?.price ?? 0) * line.quantity;
  }, 0);

  const tax = providerName === "mock" ? subtotal * 0.0825 : 0;
  const total = subtotal + tax;

  const checkout = async () => {
    const url = await commerceProvider.getOrderHandoffUrl(locationId);
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: colors.forest
    });
  };

  if (loading) {
    return (
      <AppScreen>
        <LoadingState label="Loading rewards…" />
      </AppScreen>
    );
  }

  if (error || !data) {
    return (
      <AppScreen>
        <ErrorState message={error?.message ?? "Rewards are unavailable."} retry={retry} />
      </AppScreen>
    );
  }

  const remaining = Math.max(0, data.freeDrinkAt - data.points);
  const progress = Math.min(1, data.points / Math.max(1, data.freeDrinkAt));

  return (
    <AppScreen>
      <View style={styles.header}>
        <View style={styles.headerMeta}>
          <Text allowFontScaling style={styles.edition}>CASA CLUB · MEMBER PASS</Text>
          <Text allowFontScaling style={styles.edition}>
            {locationId === "friendswood" ? "FRIENDSWOOD" : "WEBSTER"}
          </Text>
        </View>
        <Text allowFontScaling style={styles.title}>Rewards,{"
"}but make it <Text style={styles.titleItalic}>familia.</Text></Text>
      </View>

      <View style={styles.passport}>
        <View style={styles.passportNotchLeft} />
        <View style={styles.passportNotchRight} />

        <View style={styles.passportTop}>
          <View>
            <Text allowFontScaling style={styles.passportEyebrow}>CASA MATCHA · MEMBER 001</Text>
            <Text allowFontScaling style={styles.points}>{data.points}</Text>
            <Text allowFontScaling style={styles.pointsLabel}>POINTS</Text>
          </View>
          <AstronautBadge size={94} />
        </View>

        <View style={styles.passportRule} />

        <View style={styles.passportProgressRow}>
          <View style={styles.progressCopy}>
            <Text allowFontScaling style={styles.progressMain}>{remaining} to go.</Text>
            <Text allowFontScaling style={styles.progressSub}>Then the next drink is on the Casa.</Text>
          </View>
          <Text allowFontScaling style={styles.progressRatio}>
            {data.points}/{data.freeDrinkAt}
          </Text>
        </View>

        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: data.freeDrinkAt, now: data.points }}
          style={styles.track}
        >
          <View
            style={[
              styles.fill,
              { width: (String(progress * 100) + "%") as `${number}%` }
            ]}
          />
        </View>

        <View style={styles.passportBottom}>
          <Text allowFontScaling style={styles.passportSerial}>CM · GOOD DRINKS · 2026</Text>
          <Text allowFontScaling style={styles.passportSerial}>✦</Text>
        </View>
      </View>

      <View style={styles.perksBlock}>
        <View style={styles.sectionLabelRow}>
          <Text allowFontScaling style={styles.sectionEyebrow}>MEMBER PERKS</Text>
          <Text allowFontScaling style={styles.sectionCount}>04</Text>
        </View>
        <View style={styles.perks}>
          <Perk icon="heart-outline" number="01" label="Earn points" />
          <Perk icon="shopping-outline" number="02" label="Order ahead" />
          <Perk icon="star-four-points-outline" number="03" label="Exclusive drops" />
          <Perk icon="cake-variant-outline" number="04" label="Birthday rewards" />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text allowFontScaling style={styles.sectionEyebrow}>RUN IT BACK</Text>
            <Text allowFontScaling style={styles.sectionTitle}>Recent orders.</Text>
          </View>
          <Text allowFontScaling style={styles.sectionCount}>
            {String(data.recentOrders.length).padStart(2, "0")}
          </Text>
        </View>

        {data.recentOrders.length ? (
          data.recentOrders.map((order, index) => {
            const first = menuItems.find((item) => item.id === order.itemIds[0]);
            return (
              <View key={order.id} style={styles.recentCard}>
                <Text allowFontScaling={false} style={styles.recentIndex}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
                {first ? (
                  <Image
                    source={{ uri: first.image }}
                    style={styles.thumb}
                    contentFit="cover"
                    accessibilityLabel={first.name}
                  />
                ) : null}
                <View style={styles.recentCopy}>
                  <Text allowFontScaling style={styles.recentName}>
                    {first?.name ?? "Recent order"}
                  </Text>
                  <Text allowFontScaling style={styles.recentMeta}>
                    {order.locationId === "friendswood" ? "Friendswood" : "Webster"} · {order.label}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reorder recent items"
                  onPress={() => order.itemIds.forEach(addToCart)}
                  style={({ pressed }) => [styles.reorder, pressed && { opacity: 0.78 }]}
                >
                  <MaterialCommunityIcons name="refresh" size={18} color={colors.forest} />
                </Pressable>
              </View>
            );
          })
        ) : (
          <EmptyState title="No recent orders yet." body="Your favorites will be easy to reorder here." />
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text allowFontScaling style={styles.sectionEyebrow}>THE RECEIPT</Text>
            <Text allowFontScaling style={styles.sectionTitle}>Your cart.</Text>
          </View>
          <Text allowFontScaling style={styles.sectionCount}>
            {String(cart.length).padStart(2, "0")}
          </Text>
        </View>

        {cart.length === 0 ? (
          <EmptyState title="Your cart is waiting." body="Add a drink from the Menu and it will show up here." />
        ) : (
          <View style={styles.receipt}>
            <View style={styles.receiptHeader}>
              <Text allowFontScaling style={styles.receiptBrand}>CASA MATCHA</Text>
              <Text allowFontScaling style={styles.receiptMeta}>ORDER PREVIEW · PHASE 1</Text>
            </View>

            <View style={styles.receiptRule} />

            {cart.map((line) => {
              const item = menuItems.find((candidate) => candidate.id === line.itemId);
              if (!item) return null;

              return (
                <View key={line.itemId} style={styles.cartLine}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.cartThumb}
                    contentFit="cover"
                    accessibilityLabel={item.name}
                  />
                  <View style={styles.cartCopy}>
                    <Text allowFontScaling style={styles.cartName}>{item.name}</Text>
                    <Text allowFontScaling style={styles.cartPrice}>
                      {"$" + item.price.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.stepper}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={"Decrease " + item.name}
                      onPress={() => updateQuantity(item.id, line.quantity - 1)}
                      style={styles.stepButton}
                    >
                      <MaterialCommunityIcons name="minus" size={16} color={colors.forest} />
                    </Pressable>
                    <Text allowFontScaling style={styles.qty}>{line.quantity}</Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={"Increase " + item.name}
                      onPress={() => updateQuantity(item.id, line.quantity + 1)}
                      style={styles.stepButton}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color={colors.forest} />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <View style={styles.receiptRule} />

            <View style={styles.totals}>
              <Row label="Subtotal" value={"$" + subtotal.toFixed(2)} />
              <Row
                label={providerName === "mock" ? "Tax · demo 8.25%" : "Tax"}
                value={"$" + tax.toFixed(2)}
                muted
              />
              <View style={styles.totalRule} />
              <Row label="Total" value={"$" + total.toFixed(2)} strong />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Checkout with Toast"
              onPress={checkout}
              style={({ pressed }) => [styles.checkout, pressed && { transform: [{ scale: 0.99 }] }]}
            >
              <View>
                <Text allowFontScaling style={styles.checkoutEyebrow}>HAND OFF TO TOAST</Text>
                <Text allowFontScaling style={styles.checkoutText}>Checkout</Text>
              </View>
              <View style={styles.checkoutArrow}>
                <MaterialCommunityIcons name="arrow-top-right" size={19} color={colors.forest} />
              </View>
            </Pressable>

            <Text allowFontScaling style={styles.demoNote}>
              Phase 1 demo cart · production totals and payment stay with Toast.
            </Text>
          </View>
        )}
      </View>
    </AppScreen>
  );
}

function Perk({
  icon,
  number,
  label
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  number: string;
  label: string;
}) {
  return (
    <View style={styles.perk}>
      <View style={styles.perkTop}>
        <Text allowFontScaling={false} style={styles.perkNumber}>{number}</Text>
        <MaterialCommunityIcons name={icon} size={19} color={colors.forest} />
      </View>
      <Text allowFontScaling style={styles.perkLabel}>{label}</Text>
    </View>
  );
}

function Row({
  label,
  value,
  strong,
  muted
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text
        allowFontScaling
        style={[styles.rowLabel, strong && styles.rowStrong, muted && { color: colors.muted }]}
      >
        {label}
      </Text>
      <Text
        allowFontScaling
        style={[styles.rowValue, strong && styles.rowStrong, muted && { color: colors.muted }]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xs, gap: 10 },
  headerMeta: { flexDirection: "row", justifyContent: "space-between" },
  edition: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.15,
    color: colors.muted
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 46,
    letterSpacing: -1.8,
    color: colors.forest
  },
  titleItalic: {
    fontFamily: fonts.displayRegular,
    fontStyle: "italic",
    color: colors.caramel
  },

  passport: {
    minHeight: 326,
    borderRadius: 30,
    padding: 22,
    backgroundColor: colors.forest3,
    overflow: "hidden",
    ...shadow.float
  },
  passportNotchLeft: {
    position: "absolute",
    left: -13,
    top: 172,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.cream
  },
  passportNotchRight: {
    position: "absolute",
    right: -13,
    top: 172,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.cream
  },
  passportTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  passportEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.25,
    color: colors.goldLight
  },
  points: {
    marginTop: 12,
    fontFamily: fonts.display,
    fontSize: 68,
    lineHeight: 66,
    letterSpacing: -2.5,
    color: colors.cream
  },
  pointsLabel: {
    marginTop: 2,
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.5,
    color: "rgba(243,236,221,0.62)"
  },
  passportRule: {
    marginVertical: 18,
    borderStyle: "dashed",
    borderTopWidth: 1,
    borderColor: "rgba(243,236,221,0.2)"
  },
  passportProgressRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16
  },
  progressCopy: { flex: 1, gap: 3 },
  progressMain: {
    fontFamily: fonts.displayRegular,
    fontSize: 22,
    color: colors.goldLight
  },
  progressSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: "rgba(243,236,221,0.66)"
  },
  progressRatio: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.0,
    color: "rgba(243,236,221,0.6)"
  },
  track: {
    height: 6,
    borderRadius: 999,
    marginTop: 13,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden"
  },
  fill: { height: "100%", borderRadius: 999, backgroundColor: colors.goldLight },
  passportBottom: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  passportSerial: {
    fontFamily: fonts.bodyMedium,
    fontSize: 7.5,
    letterSpacing: 1.1,
    color: "rgba(243,236,221,0.48)"
  },

  perksBlock: { gap: 12 },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionEyebrow: {
    ...type.label,
    fontSize: 8,
    letterSpacing: 1.25,
    color: colors.gold
  },
  sectionCount: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.1,
    color: colors.muted
  },
  perks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10
  },
  perk: {
    width: "48.4%",
    minHeight: 105,
    padding: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,249,238,0.56)",
    justifyContent: "space-between"
  },
  perkTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  perkNumber: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.1,
    color: colors.gold
  },
  perkLabel: {
    fontFamily: fonts.displayRegular,
    fontSize: 18,
    lineHeight: 20,
    color: colors.forest
  },

  section: { gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  sectionTitle: {
    marginTop: 3,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 31,
    letterSpacing: -0.9,
    color: colors.forest
  },

  recentCard: {
    minHeight: 90,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  recentIndex: {
    width: 22,
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.0,
    color: colors.gold
  },
  thumb: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: colors.paper
  },
  recentCopy: { flex: 1 },
  recentName: {
    fontFamily: fonts.display,
    fontSize: 18,
    lineHeight: 20,
    color: colors.ink
  },
  recentMeta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.muted
  },
  reorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border
  },

  receipt: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: colors.foam,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card
  },
  receiptHeader: { gap: 3 },
  receiptBrand: {
    fontFamily: fonts.display,
    fontSize: 21,
    letterSpacing: -0.5,
    color: colors.forest
  },
  receiptMeta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 7.5,
    letterSpacing: 1.1,
    color: colors.muted
  },
  receiptRule: {
    marginVertical: 15,
    borderStyle: "dashed",
    borderTopWidth: 1,
    borderColor: colors.border
  },
  cartLine: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  cartThumb: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: colors.paper
  },
  cartCopy: { flex: 1 },
  cartName: {
    fontFamily: fonts.displayRegular,
    fontSize: 16,
    color: colors.ink
  },
  cartPrice: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: colors.muted
  },
  stepper: { flexDirection: "row", alignItems: "center", gap: 5 },
  stepButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  qty: {
    minWidth: 18,
    textAlign: "center",
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink
  },
  totals: { gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontFamily: fonts.body, fontSize: 12.5, color: colors.ink },
  rowValue: { fontFamily: fonts.bodyMedium, fontSize: 12.5, color: colors.ink },
  rowStrong: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.forest
  },
  totalRule: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  checkout: {
    minHeight: 66,
    marginTop: 16,
    borderRadius: 22,
    paddingHorizontal: 16,
    backgroundColor: colors.forest3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  checkoutEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 7.5,
    letterSpacing: 1.15,
    color: colors.goldLight
  },
  checkoutText: {
    marginTop: 3,
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.cream
  },
  checkoutArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldLight
  },
  demoNote: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.muted,
    textAlign: "center"
  }
});
