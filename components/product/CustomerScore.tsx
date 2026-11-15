import type { ProductBadges } from "../../lib/badges";

import { StyleSheet, Text, View } from "react-native";

import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";

/**
 * What customers make of a product, small, beside its name on a tile: their average stars, or
 * their likes and dislikes - whichever way the shop has them vote (Sales rules → Social). The
 * API sends one or the other only while the shop takes votes and somebody has voted, so a shop
 * that takes none shows nothing here. Read-only: voting is on the product screen.
 */
export function CustomerScore({
  rating,
  likes,
}: Pick<ProductBadges, "rating" | "likes">) {
  if (rating) {
    const average = rating.average.toFixed(1);

    return (
      <View
        accessibilityLabel={t("badges.rated", { average, count: rating.count })}
        style={styles.score}
      >
        <Text style={styles.star}>{"★"}</Text>
        <Text style={styles.value}>{average}</Text>
      </View>
    );
  }

  if (!likes) return null;

  return (
    <View
      accessibilityLabel={t("badges.liked", {
        likes: likes.likes,
        dislikes: likes.dislikes,
      })}
      style={styles.score}
    >
      <Text style={styles.up}>{"▲"}</Text>
      <Text style={styles.value}>{likes.likes}</Text>
      {/* Left out while nobody disliked it - which is also how a shop taking likes only reads. */}
      {likes.dislikes > 0 ? (
        <>
          <Text style={styles.down}>{"▼"}</Text>
          <Text style={styles.muted}>{likes.dislikes}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  score: { flexDirection: "row", alignItems: "center", gap: 3 },
  star: { fontSize: 13, color: colors.star },
  up: { fontSize: 9, color: colors.brand },
  down: { marginLeft: 4, fontSize: 9, color: colors.muted },
  value: { fontSize: 12.5, fontWeight: "700", color: colors.ink },
  muted: { fontSize: 12.5, color: colors.muted },
});
