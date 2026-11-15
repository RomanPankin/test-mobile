import type { ReactNode } from "react";

import { StyleSheet, Text, View } from "react-native";

import { colors, GUTTER, heading } from "../../lib/theme";

/**
 * One section down a product's or a bundle's screen - "Overview", "Tech specs", "What's in the
 * bundle" - under a rule and a heading, as the reviews are. `inset`: the section keeps the
 * screen's gutter itself, for one drawn outside the padded body (a shelf of cards does its own).
 */
export function ProductSection({
  title,
  inset = false,
  children,
}: {
  title: string;
  inset?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.title, inset ? styles.inset : null]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
    paddingTop: 24,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  title: { ...heading, fontSize: 22, color: colors.ink },
  inset: { paddingHorizontal: GUTTER },
});
