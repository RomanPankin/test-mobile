import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { colors } from "../lib/theme";

const SIZE = 38;

/**
 * A round button for a header: a grey disc on the white bar, or - `floating`, over a product's
 * photo or the hero - a white one with a hairline, which reads on the grey the photos are shot
 * on. Every header button is one, so the bar reads as a set.
 */
export function HeaderButton({
  label,
  floating,
  wide,
  accent,
  onPress,
  children,
}: {
  label: string;
  floating?: boolean;
  /** As wide as its contents, a pill rather than a disc: the bag with its total. */
  wide?: boolean;
  /** Solid black, to be seen on the bar and over a photo alike: the bag with something in it. */
  accent?: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        floating ? styles.floating : styles.onBar,
        wide ? styles.wide : null,
        accent ? styles.accent : null,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}

/** A chevron pointing back, drawn: two sides of a turned square. */
export function BackChevron() {
  return <View style={styles.chevron} />;
}

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  onBar: { backgroundColor: colors.tile, borderColor: colors.tile },
  // Fixed over the scrolling screen - the hero, photos, text: a mostly white, slightly see-through
  // disc with a soft shadow and no edge, readable over whatever slides under it.
  floating: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderColor: "transparent",
    boxShadow: "0 2px 10px rgba(16, 24, 40, 0.12)",
  },
  wide: {
    width: "auto",
    flexDirection: "row",
    gap: 6,
    paddingLeft: 8,
    paddingRight: 12,
  },
  accent: { backgroundColor: colors.ink, borderColor: colors.ink },
  pressed: { opacity: 0.7 },
  chevron: {
    width: 10,
    height: 10,
    marginLeft: 4,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.ink,
    transform: [{ rotate: "45deg" }],
  },
});
