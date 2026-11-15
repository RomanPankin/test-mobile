import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../lib/theme";

const TONES = {
  /** The website's black pill: add to bag, checkout, sign in. */
  ink: { background: colors.ink, label: colors.white, border: colors.ink },
  /** The one blue button, where a screen needs a second strong one beside black. */
  brand: {
    background: colors.brand,
    label: colors.white,
    border: colors.brand,
  },
  quiet: { background: "transparent", label: colors.ink, border: colors.line },
  /**
   * The hero's second choice: outlined in ink, as "Learn more" is on the website - a translucent
   * white over the hero's gradient, like the floating buttons above it.
   */
  outline: {
    background: "rgba(255, 255, 255, 0.55)",
    label: colors.ink,
    border: colors.ink,
  },
};

export function ActionButton({
  label,
  onPress,
  tone = "ink",
  disabled,
  busy,
  grow,
}: {
  label: string;
  onPress: () => void;
  tone?: keyof typeof TONES;
  disabled?: boolean;
  busy?: boolean;
  grow?: boolean;
}) {
  const colours = TONES[tone];
  // Sold out and the like: the website's flat grey, not a faded black that reads as pressable.
  const off = disabled && (tone === "ink" || tone === "brand");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled), busy: Boolean(busy) }}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.button,
        grow ? styles.grow : null,
        { backgroundColor: colours.background, borderColor: colours.border },
        off ? styles.off : null,
        disabled && !off ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}
    >
      {busy ? (
        <ActivityIndicator color={colours.label} size="small" />
      ) : (
        <Text
          numberOfLines={1}
          style={[styles.label, { color: colours.label }]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  grow: { flex: 1 },
  off: { backgroundColor: colors.disabled, borderColor: colors.disabled },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  label: { fontSize: 15.5, fontWeight: "600", letterSpacing: -0.2 },
});
