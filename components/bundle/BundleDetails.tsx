import type { BundleItem } from "../../lib/bundles";

import { StyleSheet, View } from "react-native";

import { BundleItemDetails } from "./BundleItemDetails";

/**
 * What is in the bundle, described - one `BundleItemDetails` per product it fills, the one picked
 * where a place offers a choice (`bundleItems`), a breath of space between them.
 */
export function BundleDetails({
  items,
  width,
}: {
  items: BundleItem[];
  width: number;
}) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <BundleItemDetails key={item.product.id} item={item} width={width} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 40 },
});
