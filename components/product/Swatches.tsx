import type { Colour } from "../../lib/colours";

import { Pressable, StyleSheet, View } from "react-native";

import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";

/**
 * A product's colours as round swatches, the chosen one ringed - the website's `Swatches`. Each
 * is a radio button to a screen reader ("Colour: Black Titanium"); one off sale is struck
 * through and can still be chosen, so the shopper sees it is sold out rather than missing.
 *
 * `size` is the dot's diameter: small on a card, larger on the product screen.
 */
export function Swatches({
  colours,
  value,
  onChange,
  size = 13,
}: {
  colours: Colour[];
  value: string | null;
  onChange: (id: string) => void;
  size?: number;
}) {
  if (colours.length === 0) return null;

  const ring = size + 8;

  return (
    <View
      accessibilityLabel={t("product.colour")}
      accessibilityRole="radiogroup"
      style={[styles.row, { gap: Math.round(size * 0.35) }]}
    >
      {colours.map((colour) => {
        const selected = colour.id === value;

        return (
          <Pressable
            key={colour.id}
            accessibilityLabel={t("product.colourNamed", { name: colour.name })}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            hitSlop={6}
            style={[
              styles.ring,
              { width: ring, height: ring, borderRadius: ring / 2 },
              selected ? styles.selected : null,
            ]}
            onPress={() => onChange(colour.id)}
          >
            <View
              style={[
                styles.dot,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  backgroundColor: colour.hex,
                },
                colour.available ? null : styles.off,
              ]}
            />
            {colour.available ? null : (
              <View style={[styles.strike, { width: size + 2 }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center" },
  ring: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selected: { borderColor: "rgba(17, 18, 22, 0.45)" },
  // The faint inner line the website draws, so a white swatch shows on a white page.
  dot: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.12)" },
  off: { opacity: 0.45 },
  strike: {
    position: "absolute",
    height: 1.5,
    backgroundColor: colors.muted,
    transform: [{ rotate: "-45deg" }],
  },
});
