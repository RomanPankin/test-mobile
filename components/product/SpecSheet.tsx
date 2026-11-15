import type { SpecGroup } from "../../lib/richText";

import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../lib/theme";

/**
 * A spec sheet, group by group - "Display", then its rows, each its label beside its value -
 * ruled above each group, as the website's "Tech specs". A row the shop wrote without a label
 * ("Console, two controllers") takes the whole width. `compact`: the smaller type a bundle's
 * item reads in.
 */
export function SpecSheet({
  groups,
  compact = false,
}: {
  groups: SpecGroup[];
  compact?: boolean;
}) {
  if (groups.length === 0) return null;

  return (
    <View>
      {groups.map((group, index) => (
        <View
          key={group.title + index}
          style={[styles.group, compact ? styles.groupCompact : null]}
        >
          {group.title ? (
            <Text style={[styles.title, compact ? styles.titleCompact : null]}>
              {group.title}
            </Text>
          ) : null}
          {group.rows.map((row, rowIndex) => (
            <View key={row.label + rowIndex} style={styles.row}>
              {row.label ? (
                <Text style={[styles.label, compact ? styles.small : null]}>
                  {row.label}
                </Text>
              ) : null}
              <Text style={[styles.value, compact ? styles.small : null]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 9,
    paddingVertical: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  groupCompact: { gap: 7, paddingVertical: 14 },
  title: { fontSize: 15, fontWeight: "600", color: colors.ink },
  titleCompact: { fontSize: 13.5 },
  row: { flexDirection: "row", gap: 14 },
  label: { flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.muted },
  value: { flex: 1.7, fontSize: 13.5, lineHeight: 19, color: colors.ink },
  small: { fontSize: 12.5, lineHeight: 17 },
});
