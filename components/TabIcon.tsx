import type { ReactNode } from "react";

import { StyleSheet, Text, View } from "react-native";

import { useCart } from "../lib/cartStore";
import { colors } from "../lib/theme";

/**
 * The tab bar's small pictures, drawn from plain views: an icon font would be one more
 * package, and a mobile app here imports a short list.
 */
export function HomeIcon({ color }: { color: string }) {
  return (
    <View style={styles.box}>
      <View
        style={[
          styles.roof,
          { borderColor: color, borderTopWidth: 2, borderLeftWidth: 2 },
        ]}
      />
      <View style={[styles.house, { borderColor: color }]} />
    </View>
  );
}

/** Four small squares, the shop's shelves. */
export function ShopIcon({ color }: { color: string }) {
  return (
    <View style={[styles.box, styles.grid]}>
      {[0, 1, 2, 3].map((index) => (
        <View key={index} style={[styles.cell, { borderColor: color }]} />
      ))}
    </View>
  );
}

export function CartIcon({
  color,
  badge = true,
}: {
  color: string;
  /** The count in a blue dot - off where the price is shown beside it instead. */
  badge?: boolean;
}) {
  const { cart } = useCart();
  const count = badge ? (cart?.count ?? 0) : 0;

  return (
    <View style={styles.box}>
      <View style={[styles.handle, { borderColor: color }]} />
      <View style={[styles.bag, { borderColor: color }]} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function AccountIcon({ color }: { color: string }) {
  return (
    <View style={styles.box}>
      <View style={[styles.head, { borderColor: color }]} />
      <View style={[styles.shoulders, { borderColor: color }]} />
    </View>
  );
}

type Icon = (props: { color: string }) => ReactNode;

/**
 * The tab bar hands its tint as any colour value; the pictures, drawn from plain views, take a
 * string - which is what this app's tints always are.
 */
function tintOf(color: unknown): string {
  return typeof color === "string" ? color : colors.muted;
}

/**
 * A tab's picture as the tab bar draws it, in the room of the pill that slides behind the
 * selected one (`TabPill`).
 */
export function tabIcon(Picture: Icon) {
  return function TabPicture({ color }: { color: unknown }) {
    return (
      <View style={styles.pill}>
        <Picture color={tintOf(color)} />
      </View>
    );
  };
}

/** A tab's name under its picture: bold on the selected tab. */
export function tabLabel(text: string) {
  return function TabName({
    focused,
    color,
  }: {
    focused: boolean;
    color: unknown;
  }) {
    return (
      <Text
        style={[
          styles.tabName,
          { color: tintOf(color) },
          focused ? styles.tabNameOn : null,
        ]}
      >
        {text}
      </Text>
    );
  };
}

const styles = StyleSheet.create({
  pill: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  tabName: { fontSize: 11, marginTop: 2 },
  tabNameOn: { fontWeight: "700" },
  box: {
    width: 26,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  roof: {
    position: "absolute",
    top: 3,
    width: 14,
    height: 14,
    borderTopLeftRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  house: {
    width: 15,
    height: 11,
    marginBottom: 1,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 3,
  },
  cell: { width: 8, height: 8, borderWidth: 2, borderRadius: 2 },
  handle: {
    position: "absolute",
    top: 1,
    width: 10,
    height: 9,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  bag: {
    width: 18,
    height: 15,
    marginBottom: 1,
    borderWidth: 2,
    borderRadius: 3,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: "700",
    color: colors.white,
  },
  head: {
    position: "absolute",
    top: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  shoulders: {
    width: 18,
    height: 8,
    marginBottom: 1,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
});
