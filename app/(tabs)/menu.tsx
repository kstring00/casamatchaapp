import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
  const [category, setCategory] = useState<MenuCategory>(
    categories.includes(requested as MenuCategory) ? (requested as MenuCategory) : "Matcha"
  );
  const [query, setQuery] = useState("");
  const { data, loading, error, retry } = useAsync(
    () => commerceProvider.getMenu(locationId),
    [locationId]
  );

  const visible = useMemo(() => {
    if (!data) return [];
    const normalized = query.trim().toLowerCase();
    return data.filter((item) => {
      const categoryMatch = item.category === category;
      const searchMatch =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.descriptor.toLowerCase().includes(normalized);
      return categoryMatch && searchMatch;
    });
  }, [data, category, query]);

  const featured = visible[0];
  const gridItems = visible.slice(1);

  const favoriteItem = (id: string) => {
    toggleFavorite(id);
    maybePromptNotifications(locationId, notificationPrefs, "favorite").catch(() => {});
  };

  return (
    <AppScreen>
      <View style={styles.editorialHead}>
        <View style={styles.editionRow}>
          <Text allowFontScaling style={styles.edition}>CASA MENU · 01</Text>
          <Text allowFontScaling style={styles.edition}>
            {locationId === "friendswood" ? "FRIENDSWOOD" : "WEBSTER"}
          </Text>
        </View>

        <Text allowFontScaling style={styles.title}>Our{"
"}Menu.</Text>

        <View style={styles.titleMeta}>
          <Text allowFontScaling style={styles.kicker}>WHISKED · PULLED · BAKED</Text>
          <Text allowFontScaling style={styles.itemCount}>{visible.length.toString().padStart(2, "0")} ITEMS</Text>
        </View>
      </View>

      <View style={styles.locationPanel}>
        <Text allowFontScaling style={styles.locationLabel}>CURRENT CASA</Text>
        <LocationToggle />
      </View>

      <View style={styles.searchWrap}>
        <MaterialCommunityIcons name="magnify" size={19} color={colors.forest} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search the menu"
          placeholderTextColor="#8A8F88"
          style={styles.search}
          accessibilityLabel="Search the menu"
          returnKeyType="search"
        />
        {query ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear menu search"
            onPress={() => setQuery("")}
            style={styles.clearSearch}
          >
            <MaterialCommunityIcons name="close" size={17} color={colors.forest} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRail}
        accessibilityRole="tablist"
      >
        {categories.map((value, index) => {
          const active = value === category;
          return (
            <Pressable
              key={value}
              onPress={() => setCategory(value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={"Show " + value + " menu items"}
              style={({ pressed }) => [styles.categoryTab, pressed && { opacity: 0.68 }]}
            >
              <Text allowFontScaling style={[styles.categoryIndex, active && styles.categoryIndexActive]}>
                0{index + 1}
              </Text>
              <Text allowFontScaling style={[styles.categoryText, active && styles.categoryTextActive]}>
                {value}
              </Text>
              <View style={[styles.categoryRule, active && styles.categoryRuleActive]} />
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? <LoadingState label="Whisking the menu…" /> : null}
      {error ? <ErrorState message={error.message} retry={retry} /> : null}
      {!loading && !error && visible.length === 0 ? (
        <EmptyState title="Nothing in this cup yet." body="Try another category or clear the search." />
      ) : null}

      {!loading && !error && featured ? (
        <>
          <FeaturedMenuCard
            item={featured}
            favorite={favorites.includes(featured.id)}
            onFavorite={() => favoriteItem(featured.id)}
            onAdd={() => addToCart(featured.id)}
            onOpen={() => router.push({ pathname: "/menu-item/[id]", params: { id: featured.id } })}
          />

          {gridItems.length ? (
            <View style={styles.productGrid}>
              {gridItems.map((item, index) => (
                <EditorialMenuCard
                  key={item.id}
                  item={item}
                  index={index + 2}
                  favorite={favorites.includes(item.id)}
                  onFavorite={() => favoriteItem(item.id)}
                  onAdd={() => addToCart(item.id)}
                  onOpen={() => router.push({ pathname: "/menu-item/[id]", params: { id: item.id } })}
                />
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      {!loading && !error && visible.length > 0 ? (
        <View style={styles.footerNote}>
          <View style={styles.footerLine} />
          <Text allowFontScaling style={styles.footerText}>MADE TO ORDER · MADE TO STAY</Text>
          <View style={styles.footerLine} />
        </View>
      ) : null}
    </AppScreen>
  );
}

function FeaturedMenuCard({
  item,
  favorite,
  onFavorite,
  onAdd,
  onOpen
}: {
  item: MenuItem;
  favorite: boolean;
  onFavorite: () => void;
  onAdd: () => void;
  onOpen: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name + ", " + item.descriptor + ", $" + item.price.toFixed(2)}
      onPress={onOpen}
      style={({ pressed }) => [styles.featureCard, pressed && styles.cardPressed]}
    >
      <Image
        source={{ uri: item.image }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={180}
        accessibilityLabel={item.name}
      />
      <LinearGradient
        colors={["rgba(18,38,27,0.02)", "rgba(18,38,27,0.12)", "rgba(18,38,27,0.88)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.featureTop}>
        <View style={styles.featureBadge}>
          <Text allowFontScaling style={styles.featureBadgeText}>HOUSE PICK</Text>
        </View>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onFavorite();
          }}
          accessibilityRole="button"
          accessibilityLabel={(favorite ? "Remove " : "Favorite ") + item.name}
          style={styles.featureHeart}
        >
          <MaterialCommunityIcons
            name={favorite ? "heart" : "heart-outline"}
            size={20}
            color={favorite ? colors.caramel : colors.forest}
          />
        </Pressable>
      </View>

      <View style={styles.featureCopy}>
        <Text allowFontScaling style={styles.featureCategory}>{item.category.toUpperCase()}</Text>
        <Text allowFontScaling style={styles.featureName}>{item.name}</Text>
        <Text allowFontScaling style={styles.featureDescriptor}>{item.descriptor}</Text>

        <View style={styles.featureBottom}>
          <Text allowFontScaling style={styles.featurePrice}>{"$" + item.price.toFixed(2)}</Text>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onAdd();
            }}
            accessibilityRole="button"
            accessibilityLabel={"Add " + item.name + " to cart"}
            style={({ pressed }) => [styles.featureAdd, pressed && { transform: [{ scale: 0.94 }] }]}
          >
            <Text allowFontScaling style={styles.featureAddLabel}>ADD</Text>
            <MaterialCommunityIcons name="plus" size={18} color={colors.forest} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function EditorialMenuCard({
  item,
  index,
  favorite,
  onFavorite,
  onAdd,
  onOpen
}: {
  item: MenuItem;
  index: number;
  favorite: boolean;
  onFavorite: () => void;
  onAdd: () => void;
  onOpen: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name + ", " + item.descriptor + ", $" + item.price.toFixed(2)}
      onPress={onOpen}
      style={({ pressed }) => [styles.productCard, pressed && styles.cardPressed]}
    >
      <View style={styles.productImageWrap}>
        <Image
          source={{ uri: item.image }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={180}
          accessibilityLabel={item.name}
        />

        <View style={styles.productIndex}>
          <Text allowFontScaling={false} style={styles.productIndexText}>{String(index).padStart(2, "0")}</Text>
        </View>

        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onFavorite();
          }}
          accessibilityRole="button"
          accessibilityLabel={(favorite ? "Remove " : "Favorite ") + item.name}
          style={styles.productHeart}
        >
          <MaterialCommunityIcons
            name={favorite ? "heart" : "heart-outline"}
            size={19}
            color={favorite ? colors.caramel : colors.forest}
          />
        </Pressable>
      </View>

      <View style={styles.productBody}>
        <Text allowFontScaling numberOfLines={2} style={styles.productName}>{item.name}</Text>
        <Text allowFontScaling numberOfLines={2} style={styles.productDescriptor}>{item.descriptor}</Text>

        <View style={styles.productBottom}>
          <Text allowFontScaling style={styles.productPrice}>{"$" + item.price.toFixed(2)}</Text>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onAdd();
            }}
            accessibilityRole="button"
            accessibilityLabel={"Add " + item.name + " to cart"}
            style={({ pressed }) => [styles.productAdd, pressed && { transform: [{ scale: 0.93 }] }]}
          >
            <MaterialCommunityIcons name="plus" size={18} color={colors.cream} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  editorialHead: { paddingTop: spacing.xs, gap: 10 },
  editionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  edition: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.25,
    color: colors.muted
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 56,
    lineHeight: 51,
    letterSpacing: -2.2,
    color: colors.forest
  },
  titleMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kicker: { ...type.label, color: colors.gold },
  itemCount: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.1,
    color: colors.muted
  },

  locationPanel: {
    gap: 6,
    padding: 8,
    borderRadius: 24,
    backgroundColor: "rgba(255,249,238,0.72)",
    borderWidth: 1,
    borderColor: colors.border
  },
  locationLabel: {
    ...type.label,
    fontSize: 8,
    letterSpacing: 1.2,
    color: colors.gold,
    marginLeft: 10
  },

  searchWrap: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(31,58,43,0.24)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: spacing.md,
    paddingRight: 6
  },
  search: {
    flex: 1,
    minHeight: 44,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink
  },
  clearSearch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(31,58,43,0.06)"
  },

  categoryRail: { gap: 24, paddingRight: 28 },
  categoryTab: { minHeight: 58, minWidth: 74, justifyContent: "flex-end", gap: 4 },
  categoryIndex: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.1,
    color: "#A0A49E"
  },
  categoryIndexActive: { color: colors.gold },
  categoryText: {
    fontFamily: fonts.displayRegular,
    fontSize: 20,
    color: "#92978F"
  },
  categoryTextActive: { color: colors.forest },
  categoryRule: { height: 1, backgroundColor: "rgba(31,58,43,0.12)", marginTop: 4 },
  categoryRuleActive: { height: 2, backgroundColor: colors.forest },

  featureCard: {
    minHeight: 390,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: colors.paper,
    ...shadow.float
  },
  featureTop: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  featureBadge: {
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 11,
    backgroundColor: "rgba(255,249,238,0.92)"
  },
  featureBadgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.15,
    color: colors.forest
  },
  featureHeart: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,249,238,0.94)",
    alignItems: "center",
    justifyContent: "center"
  },
  featureCopy: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
    gap: 6
  },
  featureCategory: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.4,
    color: colors.goldLight
  },
  featureName: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 36,
    letterSpacing: -1.2,
    color: colors.cream
  },
  featureDescriptor: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(243,236,221,0.76)"
  },
  featureBottom: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  featurePrice: {
    fontFamily: fonts.displayRegular,
    fontSize: 21,
    color: colors.cream
  },
  featureAdd: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingLeft: 17,
    paddingRight: 10,
    backgroundColor: colors.goldLight,
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  featureAddLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.forest
  },

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 22
  },
  productCard: { width: "48.3%", gap: 10 },
  productImageWrap: {
    height: 218,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.paper,
    ...shadow.card
  },
  productIndex: {
    position: "absolute",
    top: 10,
    left: 10,
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(18,38,27,0.84)",
    alignItems: "center",
    justifyContent: "center"
  },
  productIndexText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.0,
    color: colors.goldLight
  },
  productHeart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,249,238,0.92)"
  },
  productBody: { minHeight: 128, gap: 5 },
  productName: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 21,
    letterSpacing: -0.45,
    color: colors.forest
  },
  productDescriptor: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.muted,
    minHeight: 34
  },
  productBottom: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  productPrice: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink },
  productAdd: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center"
  },
  cardPressed: { transform: [{ scale: 0.988 }], opacity: 0.95 },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: spacing.md
  },
  footerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  footerText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.15,
    color: colors.muted
  }
});
