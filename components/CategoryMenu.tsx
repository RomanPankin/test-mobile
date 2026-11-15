import type { Catalogue } from "../lib/catalogue";

import { useEffect, useRef, type ComponentRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { productsInCategory } from "../lib/catalogue";
import { t } from "../lib/strings";
import { colors, GUTTER } from "../lib/theme";

import { CategoryChip } from "./CategoryChip";
import { ProductGrid } from "./product/ProductGrid";
import { StateView } from "./StateView";

/** A chip's width in the strip, roughly: where the chosen one sits, to scroll it into view. */
const STEP = 120;

/**
 * The shop by category: a strip of chips to switch between them, and the chosen one's products
 * two to a row. For the Shop tab and a category opened from the home screen.
 */
export function CategoryMenu({
  catalogue,
  selected,
  onSelect,
}: {
  catalogue: Catalogue;
  selected: string | undefined;
  onSelect: (id: string) => void;
}) {
  const { categories } = catalogue;
  const strip = useRef<ComponentRef<typeof ScrollView>>(null);
  const list = useRef<ComponentRef<typeof ScrollView>>(null);

  // Opened on a category far along the strip: bring its chip into sight.
  useEffect(() => {
    const index = categories.findIndex((category) => category.id === selected);

    if (index > 1)
      strip.current?.scrollTo({ x: (index - 1) * STEP, animated: false });
  }, []);

  // A new category starts at its top, not where the last one was scrolled to.
  useEffect(() => {
    list.current?.scrollTo({ y: 0, animated: false });
  }, [selected]);

  const products = selected
    ? productsInCategory(catalogue, selected)
    : catalogue.products;

  return (
    <View style={styles.screen}>
      <View style={styles.bar}>
        <ScrollView
          ref={strip}
          horizontal
          contentContainerStyle={styles.chips}
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              selected={category.id === selected}
              onPress={() => onSelect(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={list}
        contentContainerStyle={styles.list}
        style={styles.listBox}
      >
        {products.length === 0 ? (
          <StateView
            message={t("shop.emptyMessage")}
            title={t("shop.emptyTitle")}
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  bar: {
    backgroundColor: colors.page,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  chips: { paddingHorizontal: GUTTER, paddingVertical: 10, gap: 8 },
  listBox: { flex: 1 },
  list: { flexGrow: 1, paddingTop: 16, paddingBottom: 32 },
});
