import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../lib/theme";

/**
 * The tones a product's badges come in, as the website draws them: a deal in the brand's blue,
 * the shop's word ("New") in ink, sold out in white with a hairline over the grey photo.
 */
const TONES = {
  deal: { background: colors.brand, label: colors.white, border: colors.brand },
  mark: { background: colors.ink, label: colors.white, border: colors.ink },
  soldOut: { background: colors.white, label: colors.ink, border: colors.line },
};

/** One short word on a product - "Save 10%", "New", "Sold out". */
export function BadgePill({
  label,
  tone,
  accessibilityLabel,
}: {
  label: string;
  tone: keyof typeof TONES;
  /** The deal's own name, where the pill's words are only its arithmetic. */
  accessibilityLabel?: string;
}) {
  const colours = TONES[tone];

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.pill,
        { backgroundColor: colours.background, borderColor: colours.border },
      ]}
    >
      <Text numberOfLines={1} style={[styles.label, { color: colours.label }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    height: 22,
    maxWidth: 180,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  label: { fontSize: 11, fontWeight: "600" },
});
