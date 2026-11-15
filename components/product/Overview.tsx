import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../lib/theme";

/**
 * A product's long description (`OVERVIEW`), a paragraph each - the website's "Overview".
 * `compact`: the smaller type a bundle's item reads in.
 */
export function Overview({
  paragraphs,
  compact = false,
}: {
  paragraphs: string[];
  compact?: boolean;
}) {
  if (paragraphs.length === 0) return null;

  return (
    <View style={compact ? styles.listCompact : styles.list}>
      {paragraphs.map((paragraph, index) => (
        <Text
          key={index}
          style={[styles.paragraph, compact ? styles.compact : null]}
        >
          {paragraph}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  listCompact: { gap: 10 },
  paragraph: { fontSize: 15.5, lineHeight: 24, color: colors.body },
  compact: { fontSize: 14.5, lineHeight: 22 },
});
