import type { BundleItem } from "../../lib/bundles";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { openProduct } from "../../lib/openProduct";
import { overviewOf, specSheetOfProduct } from "../../lib/specs";
import { t } from "../../lib/strings";
import { colors, heading } from "../../lib/theme";
import { Gallery } from "../product/Gallery";
import { Overview } from "../product/Overview";
import { SpecSheet } from "../product/SpecSheet";

/** How many spec groups an item shows before "All specifications" - the ones buyers read first. */
const SPEC_GROUPS = 3;
/** How much of its overview an item tells - the rest is on its own screen. */
const PARAGRAPHS = 2;

/**
 * One product of a bundle, described on the bundle's screen - the website's `BundleItem`: its
 * photos (the product screen's gallery), which place it fills ("Your phone"), its name and spec
 * line, the start of its overview and the first groups of its spec sheet, with the way to its own
 * screen for everything else. A buyer judging a kit should not have to open three products to
 * know what is in it.
 */
export function BundleItemDetails({
  item,
  width,
}: {
  item: BundleItem;
  width: number;
}) {
  const { product, place } = item;
  const groups = specSheetOfProduct(product);
  const shown = groups.slice(0, SPEC_GROUPS);
  const more = groups.length > SPEC_GROUPS;
  const open = () => void openProduct(product);

  return (
    <View>
      <View style={styles.gallery}>
        <Gallery
          height={Math.round(width * 0.75)}
          media={product.media}
          width={width}
        />
      </View>
      <Text style={styles.place}>{place.toUpperCase()}</Text>
      <Pressable accessibilityRole="link" onPress={open}>
        <Text style={styles.name}>{product.name}</Text>
      </Pressable>
      {product.description ? (
        <Text style={styles.spec}>{product.description}</Text>
      ) : null}
      <View style={styles.overview}>
        <Overview
          compact
          paragraphs={overviewOf(product).slice(0, PARAGRAPHS)}
        />
      </View>
      {shown.length > 0 ? (
        <View style={styles.specs}>
          <SpecSheet compact groups={shown} />
        </View>
      ) : null}
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => [styles.link, pressed ? styles.pressed : null]}
        onPress={open}
      >
        <Text style={styles.linkLabel}>
          {more ? t("bundle.allSpecs") : t("bundle.openProduct")}
          {"  →"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  gallery: { borderRadius: 16, overflow: "hidden" },
  place: {
    marginTop: 18,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: colors.brand,
  },
  name: {
    ...heading,
    marginTop: 4,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  spec: { marginTop: 4, fontSize: 14, color: colors.muted },
  overview: { marginTop: 14 },
  specs: { marginTop: 16 },
  link: { alignSelf: "flex-start", marginTop: 14, paddingVertical: 4 },
  pressed: { opacity: 0.6 },
  linkLabel: { fontSize: 14, fontWeight: "600", color: colors.brand },
});
