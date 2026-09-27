import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { menuItems } from "@/data/mock";
import { useAppState } from "@/state/AppState";
import { colors, fonts, radius, shadow, spacing, type } from "@/theme";

export default function MenuItemModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useMemo(() => menuItems.find((candidate) => candidate.id === id), [id]);
  const { addToCart } = useAppState();
  const [selected, setSelected] = useState<Record<string, string>>({});

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.title}>This item floated away.</Text>
          <Pressable onPress={() => router.back()} style={styles.primary}><Text style={styles.primaryText}>Back to menu</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const add = () => { addToCart(item.id); router.back(); };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={{ uri: item.image }} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel={item.name} />
          <Pressable accessibilityRole="button" accessibilityLabel="Close item details" onPress={() => router.back()} style={styles.close}>
            <MaterialCommunityIcons name="close" size={24} color={colors.forest} />
          </Pressable>
        </View>

        <View style={styles.copy}>
          <Text allowFontScaling style={styles.eyebrow}>{item.category.toUpperCase()}</Text>
          <Text allowFontScaling style={styles.title}>{item.name}</Text>
          <Text allowFontScaling style={styles.descriptor}>{item.descriptor}</Text>
          <Text allowFontScaling style={styles.price}>{"$" + item.price.toFixed(2)}</Text>
        </View>

        {item.modifiers.map((group) => (
          <View key={group.id} style={styles.group}>
            <View style={styles.groupHead}>
              <Text allowFontScaling style={styles.groupTitle}>{group.label}</Text>
              {group.required ? <Text allowFontScaling style={styles.required}>REQUIRED</Text> : null}
            </View>
            <View style={styles.options}>
              {group.options.map((option) => {
                const active = selected[group.id] === option.id;
                return (
                  <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => setSelected((current) => ({ ...current, [group.id]: option.id }))} style={[styles.option, active && styles.optionActive]}>
                    <Text allowFontScaling style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
                    {option.priceDelta ? <Text allowFontScaling style={[styles.delta, active && styles.optionTextActive]}>{"+$" + option.priceDelta.toFixed(2)}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable accessibilityRole="button" accessibilityLabel={"Add " + item.name + " to cart"} onPress={add} style={styles.primary}>
          <Text allowFontScaling style={styles.primaryText}>{"Add to cart · $" + item.price.toFixed(2)}</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.cream} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { paddingBottom: 44 },
  hero: { height: 330, margin: spacing.md, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.paper, ...shadow.card },
  close: { position: "absolute", top: spacing.sm, right: spacing.sm, width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,249,238,0.92)", alignItems: "center", justifyContent: "center" },
  copy: { paddingHorizontal: spacing.lg, gap: 6 },
  eyebrow: { ...type.label, color: colors.gold },
  title: { ...type.displayL, color: colors.forest },
  descriptor: { ...type.body, color: colors.muted },
  price: { fontFamily: fonts.bodyMedium, color: colors.ink, fontSize: 17, marginTop: 4 },
  group: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm },
  groupHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  groupTitle: { ...type.title, color: colors.forest },
  required: { ...type.label, color: colors.gold },
  options: { gap: spacing.xs },
  option: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.foam },
  optionActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  optionText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.forest },
  optionTextActive: { color: colors.cream },
  delta: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  primary: { minHeight: 54, marginHorizontal: spacing.lg, marginTop: spacing.xl, borderRadius: radius.pill, paddingHorizontal: spacing.lg, backgroundColor: colors.forest, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  primaryText: { fontFamily: fonts.bodyMedium, color: colors.cream, fontSize: 15 },
  missing: { flex: 1, justifyContent: "center", padding: spacing.lg, gap: spacing.lg }
});
