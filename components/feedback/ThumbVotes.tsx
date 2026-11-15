import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";

/**
 * A like and a dislike, each with its count - a thumb up and a thumb down, the customer's own
 * tinted (green for a like, red for a dislike). `likeOnly` is a shop taking likes alone (`up`):
 * no dislike to press. The thumbs are the phone's own emoji: in colour on every phone, with no
 * icon package (a mobile app here imports a short list).
 */
export function ThumbVotes({
  likes,
  dislikes,
  mine,
  likeOnly = false,
  onVote,
  size = "md",
}: {
  likes: number;
  dislikes: number;
  /** 1, -1, or null / 0 for none. */
  mine: number | null;
  likeOnly?: boolean;
  onVote?: (value: number) => void;
  size?: "sm" | "md";
}) {
  return (
    <View style={styles.row}>
      <Vote
        active={mine === 1}
        count={likes}
        glyph="👍"
        tone="like"
        label={t("feedback.like")}
        size={size}
        onPress={onVote ? () => onVote(1) : undefined}
      />
      {likeOnly ? null : (
        <Vote
          active={mine === -1}
          count={dislikes}
          glyph="👎"
          tone="dislike"
          label={t("feedback.dislike")}
          size={size}
          onPress={onVote ? () => onVote(-1) : undefined}
        />
      )}
    </View>
  );
}

function Vote({
  glyph,
  tone,
  label,
  count,
  active,
  size,
  onPress,
}: {
  glyph: string;
  tone: "like" | "dislike";
  label: string;
  count: number;
  active: boolean;
  size: "sm" | "md";
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label}, ${count}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      disabled={!onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.vote,
        size === "sm" ? styles.voteSm : null,
        active ? (tone === "like" ? styles.liked : styles.disliked) : null,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.glyph,
          size === "sm" ? styles.glyphSm : null,
        ]}
      >
        {glyph}
      </Text>
      <Text
        style={[
          styles.count,
          size === "sm" ? styles.countSm : null,
          active ? (tone === "like" ? styles.likedText : styles.dislikedText) : null,
        ]}
      >
        {count}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  vote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.tile,
  },
  voteSm: { height: 26, paddingHorizontal: 9, gap: 4 },
  liked: { backgroundColor: "#e3f5ea" },
  disliked: { backgroundColor: "#fde8e7" },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  glyph: { fontSize: 16, lineHeight: 20 },
  glyphSm: { fontSize: 13, lineHeight: 16 },
  count: { fontSize: 14, fontWeight: "600", color: colors.ink },
  countSm: { fontSize: 12 },
  likedText: { color: "#167a45" },
  dislikedText: { color: "#b42318" },
});
