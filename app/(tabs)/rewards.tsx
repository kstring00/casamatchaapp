import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { AstronautBadge, Sparkle } from "@/components/Brand";
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState";
import { menuItems } from "@/data/mock";
import { commerceProvider } from "@/providers";
import { useAppState } from "@/state/AppState";
import { colors, fonts, radius, shadow, spacing, type } from "@/theme";
import { useAsync } from "@/lib/useAsync";

const providerName = ((Constants.expoConfig?.extra ?? {}) as { commerceProvider?: string }).commerceProvider ?? "mock";

export default function RewardsScreen() {
  const { locationId, cart, addToCart, updateQuantity } = useAppState();
  const { data, loading, error, retry } = useAsync(() => commerceProvider.getRewards("demo-user"), [locationId]);

  const subtotal = cart.reduce((sum, line) => {
    const item = menuItems.find((candidate) => candidate.id === line.itemId);
    return sum + (item?.price ?? 0) * line.quantity;
  }, 0);
  // Mock mode only. Real checkout/tax calculation belongs to Toast in Phase 3.
  const tax = providerName === "mock" ? subtotal * 0.0825 : 0;
  const total = subtotal + tax;

  const checkout = async () => {
    const url = await commerceProvider.getOrderHandoffUrl(locationId);
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      controlsColor: colors.forest
    });
  };

  if (loading) return <AppScreen><LoadingState label="Loading rewards…" /></AppScreen>;
  if (error || !data) return <AppScreen><ErrorState message={error?.message ?? "Rewards are unavailable."} retry={retry} /></AppScreen>;

  const remaining = Math.max(0, data.freeDrinkAt - data.points);
  const progress = Math.min(1, data.points / Math.max(1, data.freeDrinkAt));

  return (
    <AppScreen>
      <View style={styles.header}>
        <Text allowFontScaling style={styles.title}>Rewards</Text>
        <Text allowFontScaling style={styles.kicker}>GOOD DRINKS · BRIGHTER PEOPLE</Text>
      </View>

      <View style={styles.pointsCard}>
        <View style={styles.pointsCopy}>
          <Text allowFontScaling style={styles.pointsEyebrow}>GOOD DRINKS{"\n"}BRIGHTER PEOPLE</Text>
          <Text allowFontScaling style={styles.points}>{data.points} pts</Text>
          <Text allowFontScaling style={styles.until}>{remaining} points until{"\n"}your free drink.</Text>
          <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: data.freeDrinkAt, now: data.points }} style={styles.track}>
            <View style={[styles.fill, { width: (String(progress * 100) + "%") as `${number}%` }]} />
          </View>
        </View>
        <View style={styles.mascotWrap}><AstronautBadge size={98} /></View>
        <Sparkle size={17} color={colors.goldLight} />
      </View>

      <View style={styles.perks}>
        <Perk icon="heart-outline" label="Earn Points" />
        <Perk icon="shopping-outline" label="Order Ahead" />
        <Perk icon="star-four-points-outline" label="Exclusive Drops" />
        <Perk icon="cake-variant-outline" label="Birthday Rewards" />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text allowFontScaling style={styles.sectionTitle}>Your Recent Orders</Text>
          <Text allowFontScaling style={styles.miniLink}>See all</Text>
        </View>
        {data.recentOrders.length ? data.recentOrders.map((order) => {
          const first = menuItems.find((item) => item.id === order.itemIds[0]);
          return (
            <View key={order.id} style={styles.recentCard}>
              {first ? <Image source={{ uri: first.image }} style={styles.thumb} contentFit="cover" accessibilityLabel={first.name} /> : null}
              <View style={styles.recentCopy}>
                <Text allowFontScaling style={styles.recentName}>{first?.name ?? "Recent order"}</Text>
                <Text allowFontScaling style={styles.recentMeta}>{order.locationId === "friendswood" ? "Friendswood" : "Webster"} · {order.label}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reorder recent items"
                onPress={() => order.itemIds.forEach(addToCart)}
                style={styles.reorder}
              >
                <Text allowFontScaling style={styles.reorderText}>Reorder</Text>
              </Pressable>
            </View>
          );
        }) : <EmptyState title="No recent orders yet." body="Your favorites will be easy to reorder here." />}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text allowFontScaling style={styles.sectionTitle}>Your Cart</Text>
          <Text allowFontScaling style={styles.miniLink}>{cart.length} {cart.length === 1 ? "item" : "items"}</Text>
        </View>

        {cart.length === 0 ? (
          <EmptyState title="Your cart is waiting." body="Add a drink from the Menu and it will show up here." />
        ) : (
          <View style={styles.cartCard}>
            {cart.map((line) => {
              const item = menuItems.find((candidate) => candidate.id === line.itemId);
              if (!item) return null;
              return (
                <View key={line.itemId} style={styles.cartLine}>
                  <Image source={{ uri: item.image }} style={styles.cartThumb} contentFit="cover" accessibilityLabel={item.name} />
                  <View style={styles.cartCopy}>
                    <Text allowFontScaling style={styles.cartName}>{item.name}</Text>
                    <Text allowFontScaling style={styles.cartPrice}>{"$" + item.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.stepper}>
                    <Pressable accessibilityRole="button" accessibilityLabel={"Decrease " + item.name} onPress={() => updateQuantity(item.id, line.quantity - 1)} style={styles.stepButton}>
                      <MaterialCommunityIcons name="minus" size={17} color={colors.forest} />
                    </Pressable>
                    <Text allowFontScaling style={styles.qty}>{line.quantity}</Text>
                    <Pressable accessibilityRole="button" accessibilityLabel={"Increase " + item.name} onPress={() => updateQuantity(item.id, line.quantity + 1)} style={styles.stepButton}>
                      <MaterialCommunityIcons name="plus" size={17} color={colors.forest} />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <View style={styles.totals}>
              <Row label="Subtotal" value={"$" + subtotal.toFixed(2)} />
              <Row label={providerName === "mock" ? "Tax · demo 8.25%" : "Tax"} value={"$" + tax.toFixed(2)} muted />
              <View style={styles.divider} />
              <Row label="Total" value={"$" + total.toFixed(2)} strong />
            </View>

            <Pressable accessibilityRole="button" accessibilityLabel="Checkout with Toast" onPress={checkout} style={styles.checkout}>
              <Text allowFontScaling style={styles.checkoutText}>Checkout</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.goldLight} />
            </Pressable>
            <Text allowFontScaling style={styles.demoNote}>Phase 1 demo cart · checkout hands off to Toast Online Ordering.</Text>
          </View>
        )}
      </View>
    </AppScreen>
  );
}

function Perk({ icon, label }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }) {
  return (
    <View style={styles.perk}>
      <View style={styles.perkIcon}><MaterialCommunityIcons name={icon} size={20} color={colors.forest} /></View>
      <Text allowFontScaling style={styles.perkLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <View style={styles.row}>
      <Text allowFontScaling style={[styles.rowLabel, strong && styles.rowStrong, muted && { color: colors.muted }]}>{label}</Text>
      <Text allowFontScaling style={[styles.rowValue, strong && styles.rowStrong, muted && { color: colors.muted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: spacing.xs },
  title: { ...type.displayL, color: colors.forest },
  kicker: { ...type.label, color: colors.gold, marginTop: 6 },
  pointsCard: {
    minHeight: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.forest,
    padding: spacing.lg,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    ...shadow.card
  },
  pointsCopy: { flex: 1, zIndex: 2 },
  pointsEyebrow: { ...type.label, color: colors.goldLight, marginBottom: spacing.sm },
  points: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, color: colors.goldLight },
  until: { ...type.bodySmall, color: colors.cream, marginTop: 2 },
  track: { height: 9, borderRadius: 99, backgroundColor: "rgba(255,255,255,0.18)", marginTop: spacing.md, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 99, backgroundColor: colors.goldLight },
  mascotWrap: { position: "absolute", right: 18, bottom: 32, opacity: 0.94 },
  perks: { flexDirection: "row", justifyContent: "space-between", gap: spacing.xs },
  perk: { flex: 1, alignItems: "center", gap: 7 },
  perkIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  perkLabel: { fontFamily: fonts.bodyMedium, color: colors.forest, fontSize: 10.5, lineHeight: 13, textAlign: "center" },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { ...type.title, color: colors.forest },
  miniLink: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.muted },
  recentCard: { minHeight: 76, borderRadius: radius.md, backgroundColor: colors.foam, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", padding: spacing.sm, gap: spacing.sm },
  thumb: { width: 52, height: 52, borderRadius: 13, backgroundColor: colors.paper },
  recentCopy: { flex: 1 },
  recentName: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  recentMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 3 },
  reorder: { minHeight: 44, borderRadius: radius.pill, backgroundColor: colors.forest, justifyContent: "center", paddingHorizontal: spacing.md },
  reorderText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.cream },
  cartCard: { borderRadius: radius.lg, backgroundColor: colors.foam, padding: spacing.md, gap: spacing.md, ...shadow.card },
  cartLine: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cartThumb: { width: 50, height: 50, borderRadius: 12, backgroundColor: colors.paper },
  cartCopy: { flex: 1 },
  cartName: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  cartPrice: { fontFamily: fonts.body, fontSize: 12.5, color: colors.muted, marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", gap: 7 },
  stepButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  qty: { minWidth: 18, textAlign: "center", fontFamily: fonts.bodyMedium, color: colors.ink },
  totals: { gap: 7, marginTop: spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  rowValue: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  rowStrong: { fontFamily: fonts.bodyMedium, fontSize: 18, color: colors.forest },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 5 },
  checkout: { minHeight: 54, borderRadius: radius.pill, backgroundColor: colors.forest, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  checkoutText: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.cream },
  demoNote: { fontFamily: fonts.body, fontSize: 11.5, lineHeight: 16, color: colors.muted, textAlign: "center" }
});
