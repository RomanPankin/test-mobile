import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, GUTTER, heading } from "../lib/theme";

/**
 * A section's title, the line under it, and - where there is more than the band shows - a blue
 * "View all" at the right, as the website's bands open.
 */
export function Heading({
  title,
  text,
  action,
  onAction,
}: {
  title: string;
  text?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.heading}>
      <View style={styles.words}>
        <Text style={styles.title}>{title}</Text>
        {text ? <Text style={styles.text}>{text}</Text> : null}
      </View>
      {action && onAction ? (
        <Pressable accessibilityRole="link" hitSlop={10} onPress={onAction}>
          <Text style={styles.action}>{`${action}  ›`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: GUTTER,
    marginBottom: 14,
  },
  words: { flex: 1 },
  title: { ...heading, fontSize: 23, lineHeight: 28, color: colors.ink },
  text: { marginTop: 3, fontSize: 13.5, lineHeight: 19, color: colors.muted },
  action: { fontSize: 13.5, fontWeight: "600", color: colors.brand },
});
