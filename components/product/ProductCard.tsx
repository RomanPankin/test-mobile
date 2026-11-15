import type { PublicProduct } from "@estoreclub/app";

import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { productBadges } from "../../lib/badges";
import { dealLabel } from "../../lib/badgeWords";
import { addLine } from "../../lib/cartStore";
import {
  firstColour,
  isSoldOut,
  PLAIN_VARIANT,
  productColours,
  photosInColour,
} from "../../lib/colours";
import { discounted } from "../../lib/deals";
import { openProduct } from "../../lib/openProduct";
import { photoUrl } from "../../lib/photo";
import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";
import { useCatalogue } from "../../lib/useCatalogue";

import { Photo } from "../Photo";

import { BadgePill } from "./BadgePill";
import { CustomerScore } from "./CustomerScore";
import { DealPrice } from "./DealPrice";
import { Swatches } from "./Swatches";

/**
 * One product on the grey tile, as the website's card: the photo, the name, the spec line, what
 * customers make of it, its colours, the price, and a black "Add to bag".
 *
 * The photo and the name open the product screen on the colour picked here; the swatches choose
 * the colour the button adds - and the photo, the colour's own where it has one, so a shopper who knows what they want never opens anything. A
 * product on a deal wears its pill over the photo, with the price after it beside the old one.
 * One with none left stays on the shelf: its photo fades, "Sold out" sits over it, and the
 * button says so and does nothing - as it does while a sold-out colour is picked.
 */
export function ProductCard({
  product,
  width,
}: {
  product: PublicProduct;
  width: number;
}) {
  const { catalogue } = useCatalogue();
  const colours = useMemo(
    () => productColours(product, catalogue?.hexOf ?? new Map()),
    [product, catalogue],
  );
  const [colourId, setColourId] = useState(firstColour(colours)?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const colour = colours.find((item) => item.id === colourId);
  const badges = productBadges(product, catalogue?.rules ?? []);
  const saving = badges.deal?.discount;
  const price = colour?.price ?? product.price;
  const productSoldOut = isSoldOut(product);
  const soldOut = productSoldOut || (colour ? !colour.available : false);
  const photoSize = width - 24;

  const add = async () => {
    setBusy(true);
    setFailed(false);

    try {
      await addLine({
        productId: product.id,
        quantity: 1,
        variant: PLAIN_VARIANT,
        ...(colour ? { variantId: colour.id } : {}),
      });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.card, { width }]}>
      <Pressable
        accessibilityLabel={t("product.view", { name: product.name })}
        accessibilityRole="link"
        onPress={() => void openProduct(product, colourId)}
      >
        <View style={[styles.photo, productSoldOut ? styles.faded : null]}>
          <Photo
            contain
            height={photoSize * 0.82}
            uri={photoUrl(photosInColour(product.media, colour), photoSize)}
            width={photoSize}
          />
        </View>
        {badges.deal ? (
          <View style={styles.dealPill}>
            <BadgePill
              accessibilityLabel={badges.deal.name}
              label={dealLabel(badges.deal)}
              tone="deal"
            />
          </View>
        ) : null}
        {productSoldOut ? (
          <View style={styles.soldPill}>
            <BadgePill label={t("product.soldOut")} tone="soldOut" />
          </View>
        ) : null}
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>
      </Pressable>
      {product.description ? (
        <Text numberOfLines={1} style={styles.spec}>
          {product.description}
        </Text>
      ) : null}
      <View style={styles.score}>
        <CustomerScore likes={badges.likes} rating={badges.rating} />
      </View>
      <View style={styles.swatches}>
        <Swatches colours={colours} value={colourId} onChange={setColourId} />
      </View>
      {price !== undefined ? (
        <View style={styles.price}>
          <DealPrice
            price={discounted(price, saving)}
            style={styles.priceText}
            was={saving ? price : undefined}
          />
        </View>
      ) : null}
      <Pressable
        accessibilityLabel={t("product.addNamed", { name: product.name })}
        accessibilityRole="button"
        disabled={soldOut || busy}
        style={({ pressed }) => [
          styles.add,
          soldOut ? styles.addOff : null,
          pressed || busy ? styles.pressed : null,
        ]}
        onPress={() => void add()}
      >
        <Text numberOfLines={1} style={styles.addLabel}>
          {soldOut
            ? t("product.soldOut")
            : failed
              ? t("product.notAdded")
              : t("product.addToBag")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 16,
    borderRadius: 12,
    backgroundColor: colors.tile,
  },
  photo: { alignItems: "center" },
  faded: { opacity: 0.55 },
  dealPill: { position: "absolute", top: -4, left: -4 },
  soldPill: { position: "absolute", top: -4, right: -4 },
  name: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
    letterSpacing: -0.2,
    textAlign: "center",
    color: colors.ink,
  },
  spec: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    color: colors.muted,
  },
  score: { marginTop: 4 },
  swatches: { marginTop: 8 },
  price: { marginTop: 6, marginBottom: 12 },
  priceText: { fontSize: 14, fontWeight: "600", color: colors.ink },
  add: {
    alignSelf: "stretch",
    height: 34,
    marginTop: "auto",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  addOff: { backgroundColor: colors.disabled },
  pressed: { opacity: 0.8 },
  addLabel: { fontSize: 12.5, fontWeight: "600", color: colors.white },
});
