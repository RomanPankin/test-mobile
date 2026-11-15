import { StyleSheet, Text, View, type TextStyle } from "react-native";

import { money } from "../../lib/money";
import { colors } from "../../lib/theme";

/**
 * A price, and - where a deal takes something off one unit - what it was, struck through: the
 * one line that says the deal is real. The bag's discount is the server's; this says it first.
 */
export function DealPrice({
  price,
  was,
  style,
}: {
  price: number;
  /** The price before the deal; nothing struck when it is the same. */
  was?: number;
  style: TextStyle;
}) {
  const isDeal = was !== undefined && was > price;

  return (
    <View style={styles.row}>
      {/* The deal's price in the deal's blue, as its badge is. */}
      <Text style={[style, isDeal ? styles.deal : null]}>{money(price)}</Text>
      {isDeal ? <Text style={styles.was}>{money(was)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    columnGap: 8,
  },
  deal: { color: colors.brand },
  was: {
    fontSize: 12.5,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
});
