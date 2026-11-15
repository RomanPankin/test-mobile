import type { PublicCombo } from "@estoreclub/app";

import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  apartPrice,
  bundleCover,
  bundleProductPhotos,
  bundleSoldOut,
  productsById,
} from "../../lib/bundles";
import { money } from "../../lib/money";
import { t } from "../../lib/strings";
import { colors, heading } from "../../lib/theme";
import { useCatalogue } from "../../lib/useCatalogue";
import { Photo } from "../Photo";
import { BadgePill } from "../product/BadgePill";

/**
 * One bundle in the deals band, as the website's: its picture (the shop's photograph of the set,
 * else each place's first product side by side with a "+"), its name and line, the price it
 * starts from beside what the same things cost apart - struck through, with the saving on the
 * pill - and the way in. Wider than a product card, on the same grey, so it reads as a bigger
 * shelf item rather than an advert.
 *
 * The whole card opens the bundle's screen: even a bundle of fixed products needs its colours
 * chosen, and a one-tap add would choose them for the shopper. A bundle with a place nothing on
 * sale can fill says "Sold out" and opens nothing.
 */
export function BundleCard({
  combo,
  width,
}: {
  combo: PublicCombo;
  width: number;
}) {
  const { catalogue } = useCatalogue();
  const products = productsById(catalogue?.products ?? []);
  const hexOf = catalogue?.hexOf ?? new Map<string, string>();
  const apart = apartPrice(combo, products);
  const saving = apart > combo.fromPrice ? apart - combo.fromPrice : 0;
  const soldOut = bundleSoldOut(combo, products, hexOf);
  const photo = width - 32;
  const parts = bundleProductPhotos(combo, products, photo);
  // Each part's share of the width, less the "+" between them.
  const partWidth =
    parts.length > 1 ? (photo - (parts.length - 1) * PLUS) / parts.length : photo;

  return (
    <Pressable
      accessibilityRole="link"
      disabled={soldOut}
      style={({ pressed }) => [
        styles.card,
        { width },
        pressed ? styles.pressed : null,
      ]}
      onPress={() => router.push(`/bundle/${combo.id}`)}
    >
      <View style={[styles.photo, soldOut ? styles.faded : null]}>
        {parts.length > 1 ? (
          // No photograph of the set: each place's first product side by side, a "+" between.
          <View style={[styles.parts, { width: photo, height: photo * 0.55 }]}>
            {parts.map((uri, index) => (
              <View key={uri + index} style={styles.part}>
                {index > 0 ? <Text style={styles.plus}>+</Text> : null}
                <Photo
                  contain
                  height={photo * 0.55}
                  uri={uri}
                  width={partWidth}
                />
              </View>
            ))}
          </View>
        ) : (
          <Photo
            contain
            height={photo * 0.55}
            uri={bundleCover(combo, products, photo)}
            width={photo}
          />
        )}
      </View>
      <View style={styles.pills}>
        <BadgePill
          label={
            saving
              ? t("badges.save", { amount: money(saving) })
              : t("bundle.badge")
          }
          tone="deal"
        />
        {soldOut ? (
          <BadgePill label={t("product.soldOut")} tone="soldOut" />
        ) : null}
      </View>
      <Text style={styles.eyebrow}>{t("bundle.badge").toUpperCase()}</Text>
      <Text numberOfLines={2} style={styles.name}>
        {combo.name}
      </Text>
      {combo.description ? (
        <Text numberOfLines={2} style={styles.description}>
          {combo.description}
        </Text>
      ) : null}
      <View style={styles.priceRow}>
        <Text style={styles.price}>
          {t("bundle.from", { price: money(combo.fromPrice) })}
        </Text>
        {saving ? <Text style={styles.was}>{money(apart)}</Text> : null}
      </View>
      <View style={[styles.button, soldOut ? styles.buttonOff : null]}>
        <Text style={styles.buttonLabel}>
          {soldOut ? t("product.soldOut") : t("bundle.choose")}
        </Text>
      </View>
    </Pressable>
  );
}

/** The width a "+" between two parts takes. */
const PLUS = 18;

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.tile,
  },
  pressed: { opacity: 0.85 },
  photo: { alignItems: "center", marginTop: 18 },
  faded: { opacity: 0.55 },
  parts: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  part: { flexDirection: "row", alignItems: "center" },
  plus: {
    width: PLUS,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "300",
    color: colors.muted,
  },
  pills: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eyebrow: {
    marginTop: 12,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: colors.brand,
  },
  name: {
    ...heading,
    marginTop: 4,
    fontSize: 17,
    lineHeight: 21,
    color: colors.ink,
  },
  description: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.muted,
  },
  priceRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  price: { fontSize: 15, fontWeight: "600", color: colors.ink },
  was: {
    fontSize: 12.5,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  button: {
    height: 38,
    marginTop: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  buttonOff: { backgroundColor: colors.disabled },
  buttonLabel: { fontSize: 13.5, fontWeight: "600", color: colors.white },
});
