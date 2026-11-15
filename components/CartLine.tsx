import type { PublicCart } from "@estoreclub/app";

import { StyleSheet, Text, View } from "react-native";

import { money } from "../lib/money";
import { colors, GUTTER } from "../lib/theme";

import { Photo } from "./Photo";
import { QuantityStepper } from "./QuantityStepper";
import { SwipeToRemove } from "./SwipeToRemove";

const SIZE = 72;

/** One line of the bag, as the server priced it. Swiped left, it comes out. */
export function CartLine({
  item,
  description,
  disabled,
  onQuantity,
}: {
  item: PublicCart["items"][number];
  /** Its colour, or a bundle's picks, in words. */
  description: string;
  disabled: boolean;
  onQuantity: (quantity: number) => void;
}) {
  return (
    <SwipeToRemove disabled={disabled} onRemove={() => onQuantity(0)}>
      <View style={styles.line}>
        <View style={styles.thumb}>
          <Photo contain height={SIZE - 8} uri={item.image} width={SIZE - 8} />
        </View>
        <View style={styles.body}>
          <View style={styles.top}>
            <Text numberOfLines={2} style={styles.name}>
              {item.name}
            </Text>
            <Text style={styles.total}>{money(item.total)}</Text>
          </View>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
          {item.unavailable ? (
            <Text style={styles.unavailable}>{item.unavailable}</Text>
          ) : null}
          <View style={styles.controls}>
            <QuantityStepper
              disabled={disabled}
              min={0}
              value={item.quantity}
              onChange={onQuantity}
            />
          </View>
        </View>
      </View>
    </SwipeToRemove>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    backgroundColor: colors.page,
  },
  thumb: {
    width: SIZE,
    height: SIZE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.tile,
  },
  body: { flex: 1, minWidth: 0 },
  top: { flexDirection: "row", gap: 10, justifyContent: "space-between" },
  name: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    color: colors.ink,
  },
  total: { fontSize: 15, fontWeight: "600", color: colors.ink },
  description: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  unavailable: { marginTop: 3, fontSize: 13, color: colors.danger },
  controls: { marginTop: 10, flexDirection: "row", alignItems: "center" },
});
