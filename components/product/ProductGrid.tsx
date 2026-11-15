import type { PublicProduct } from "@estoreclub/app";

import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { GUTTER } from "../../lib/theme";

import { ProductCard } from "./ProductCard";

const GAP = 12;
/** Narrower than this and a card's photo and button stop fitting: one column fewer. */
const MIN_CARD = 150;

/**
 * Products two to a row on a phone (more on a tablet), every card as wide as the next, as the
 * website's shelves are. Measures itself, so it is right in a screen and in a sheet alike.
 */
export function ProductGrid({ products }: { products: PublicProduct[] }) {
  const [width, setWidth] = useState(0);
  const inner = width - GUTTER * 2;
  const columns = Math.max(2, Math.floor((inner + GAP) / (MIN_CARD + GAP)));
  const card = Math.floor((inner - GAP * (columns - 1)) / columns);

  return (
    <View
      style={styles.grid}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0
        ? products.map((product) => (
            <ProductCard key={product.id} product={product} width={card} />
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
    paddingHorizontal: GUTTER,
  },
});
