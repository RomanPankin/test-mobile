import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";

/**
 * Stars to read and to press: the average as filled stars, or the customer's own once they
 * voted; pressing their own again takes it back (the caller's business). The average and how
 * many voted follow them, where `count` is asked for.
 */
export function StarVotes({
  average,
  count,
  max,
  mine,
  onVote,
  size = "md",
  showCount = true,
}: {
  average: number | null;
  count: number;
  max: number;
  /** Their own stars, or null / 0 for none. */
  mine: number | null;
  onVote?: (value: number) => void;
  size?: "sm" | "md";
  showCount?: boolean;
}) {
  const shown = mine || Math.round(average ?? 0);
  const glyph = size === "md" ? styles.starMd : styles.starSm;

  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {Array.from({ length: Math.max(1, max) }, (_, index) => {
          const value = index + 1;
          const filled = value <= shown;

          return (
            <Pressable
              key={value}
              accessibilityLabel={t("feedback.stars", { count: value })}
              accessibilityRole="button"
              accessibilityState={{ selected: mine === value }}
              disabled={!onVote}
              hitSlop={4}
              style={({ pressed }) => (pressed ? styles.pressed : null)}
              onPress={() => onVote?.(value)}
            >
              <Text
                style={[
                  glyph,
                  filled ? (mine ? styles.mine : styles.filled) : styles.empty,
                ]}
              >
                {filled ? "★" : "☆"}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {showCount ? (
        <Text style={size === "md" ? styles.countMd : styles.countSm}>
          {count > 0 && average !== null
            ? `${average.toFixed(1)} · ${t("feedback.ratings", { count })}`
            : t("feedback.noRatings")}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  stars: { flexDirection: "row", gap: 2 },
  starMd: { fontSize: 24, lineHeight: 28 },
  starSm: { fontSize: 15, lineHeight: 18 },
  filled: { color: colors.star },
  mine: { color: colors.brand },
  // Outlined in the gold the filled ones are: the scale reads before anyone has voted.
  empty: { color: colors.star, opacity: 0.55 },
  pressed: { opacity: 0.6 },
  countMd: { fontSize: 13.5, color: colors.muted },
  countSm: { fontSize: 12, color: colors.muted },
});
