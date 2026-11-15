import type { PublicCombo, PublicProduct } from "@estoreclub/app";

import { StyleSheet, Text, View } from "react-native";

import { bundleCover, bundleProductPhotos } from "../../lib/bundles";
import { colors } from "../../lib/theme";
import { Photo } from "../Photo";

/** The width a "+" between two parts takes. */
const PLUS = 18;

/**
 * The set as a picture, at the top of the bundle's screen - the website's `BundlePhotos`: the
 * shop's photograph of it, else each place's first product side by side with a "+" between, on
 * the grey the photos are shot on.
 */
export function BundlePhotos({
  combo,
  products,
  width,
}: {
  combo: PublicCombo;
  products: ReadonlyMap<string, PublicProduct>;
  width: number;
}) {
  const height = Math.round(width * 0.75);
  const inner = width - 32;
  const photoHeight = height - 48;
  const parts = bundleProductPhotos(combo, products, inner);
  // Each part's share of the width, less the "+" between them.
  const partWidth =
    parts.length > 1
      ? (inner - (parts.length - 1) * PLUS) / parts.length
      : inner;

  return (
    <View style={[styles.box, { width, height }]}>
      {parts.length > 1 ? (
        <View style={styles.parts}>
          {parts.map((uri, index) => (
            <View key={uri + index} style={styles.part}>
              {index > 0 ? <Text style={styles.plus}>+</Text> : null}
              <Photo contain height={photoHeight} uri={uri} width={partWidth} />
            </View>
          ))}
        </View>
      ) : (
        <Photo
          contain
          height={photoHeight}
          uri={bundleCover(combo, products, inner)}
          width={inner}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.tile,
  },
  parts: { flexDirection: "row", alignItems: "center" },
  part: { flexDirection: "row", alignItems: "center" },
  plus: {
    width: PLUS,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "300",
    color: colors.muted,
  },
});
