import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AppScreen } from "@/components/AppScreen";
import { EmptyState, ErrorState, LoadingState } from "@/components/DataState";
import { LocationToggle } from "@/components/LocationToggle";
import { maybePromptNotifications } from "@/notifications/client";
import { commerceProvider } from "@/providers";
import { useAppState } from "@/state/AppState";
import { colors, fonts, radius, shadow, spacing, type } from "@/theme";
import type { MenuCategory, MenuItem } from "@/types/commerce";
import { useAsync } from "@/lib/useAsync";

const categories: MenuCategory[] = ["Matcha", "Coffee", "Bakery", "Seasonal"];

export default function MenuScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const requested = params.category;
  const { locationId, favorites, toggleFavorite, addToCart, notificationPrefs } = useAppState();
  const [category, setCategory] = useState<MenuCategory>(categories.includes(requested as MenuCategory) ? (requested as MenuCategory) : "Matcha");
  const [query, setQuery] = useState("");
  const { data, loading, error, retry } = useAsync(() => commerceProvider.getMenu(locationId), [locationId]);

  const visible = useMemo(() => {
    if (!data) return [];
    const normalized = query.trim().toLowerCase();
    return data.filter((item) => {
      const categoryMatch = item.category === category;
      const searchMatch = !normalized || item.name.toLowerCase().includes(normalized) || item.descriptor.toLowerCase().includes(normalized);
      return categoryMatch && searchMatch;
    });
  }, [data, category, query]);

  const favoriteItem = (id: string) => {
    toggleFavorite(id);
    maybePromptNotifications(locationId, notificationPrefs, "favorite").catch(() => {});
  };

  return (
    <AppScreen>
      <View style={styles.top}>
        <View>
          <Text allowFontScaling style={styles.title}>Our Menu</Text>
          <Text allowFontScaling style={styles.kicker}>WHISKED · PULLED · BAKED</Text>
        </View>
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.forest} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search" placeholderTextColor="#8A8F88" style={styles.search} accessibilityLabel="Search the menu" returnKeyType="search" />
        </View>
      </View>

      <LocationToggle />

      <View style={styles.chips}>
        {categories.map((value) => {
          const active = value === category;
          return (
            <Pressable key={value} onPress={() => setCategory(value)} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={"Show " + value + " menu items"} style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && { opacity: 0.78 }]}>
              <Text allowFontScaling style={[styles.chipText, active && styles.chipTextActive]}>{value}</Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? <LoadingState label="Whisking the menu…" /> : null}
      {error ? <ErrorState message={error.message} retry={retry} /> : null}
      {!loading && !error && visible.length === 0 ? <EmptyState title="Nothing in this cup yet." body="Try another category or clear the search." /> : null}

      {!loading && !error ? (
        <View style={styles.grid}>
          {visible.map((item) => (
            <MenuCard key={item.id} item={item} favorite={favorites.includes(item.id)} onFavorite={() => favoriteItem(item.id)} onAdd={() => addToCart(item.id)} onOpen={() => router.push({ pathname: "/menu-item/[id]", params: { id: item.id } })} />
          ))}
        </View>
      ) : null}
    </AppScreen>
  );
}

function MenuCard({ item, favorite, onFavorite, onAdd, onOpen }: { item: MenuItem; favorite: boolean; onFavorite: () => void; onAdd: () => void; onOpen: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={item.name + ", " + item.descriptor + ", $" + item.price.toFixed(2)} onPress={onOpen} style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.985 }] }]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} accessibilityLabel={item.name} />
        <Pressable onPress={(event) => { event.stopPropagation(); onFavorite(); }} accessibilityRole="button" accessibilityLabel={(favorite ? "Remove " : "Favorite ") + item.name} style={styles.heart}>
          <MaterialCommunityIcons name={favorite ? "heart" : "heart-outline"} size={21} color={favorite ? colors.caramel : colors.forest} />
        </Pressable>
      </View>
      <View style={styles.cardBody}>
        <Text allowFontScaling numberOfLines={2} style={styles.itemName}>{item.name}</Text>
        <Text allowFontScaling numberOfLines={2} style={styles.itemDescriptor}>{item.descriptor}</Text>
        <View style={styles.priceRow}>
          <Text allowFontScaling style={styles.price}>{"$" + item.price.toFixed(2)}</Text>
          <Pressable onPress={(event) => { event.stopPropagation(); onAdd(); }} accessibilityRole="button" accessibilityLabel={"Add " + item.name + " to cart"} style={({ pressed }) => [styles.plus, pressed && { transform: [{ scale: 0.9 }] }]}>
            <MaterialCommunityIcons name="plus" size={19} color={colors.cream} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { gap: spacing.md, paddingTop: spacing.xs },
  title: { ...type.displayL, color: colors.forest },
  kicker: { ...type.label, color: colors.gold, marginTop: 6 },
  searchWrap: { minHeight: 48, borderRadius: radius.pill, backgroundColor: colors.foam, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: spacing.md },
  search: { flex: 1, minHeight: 44, fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { minHeight: 44, justifyContent: "center", borderRadius: radius.pill, paddingHorizontal: 17, backgroundColor: "rgba(31,58,43,0.07)" },
  chipActive: { backgroundColor: colors.forest },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.forest },
  chipTextActive: { color: colors.cream },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: spacing.md },
  card: { width: "48.4%", borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.foam, ...shadow.card },
  imageWrap: { height: 158, backgroundColor: colors.paper },
  heart: { position: "absolute", top: 9, right: 9, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,249,238,0.9)" },
  cardBody: { padding: spacing.sm, minHeight: 154, gap: 5 },
  itemName: { fontFamily: fonts.display, fontSize: 18, lineHeight: 20, color: colors.forest },
  itemDescriptor: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17, color: colors.muted, minHeight: 34 },
  priceRow: { marginTop: "auto", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink },
  plus: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" }
});
