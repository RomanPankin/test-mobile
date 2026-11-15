import type { ProductFeedbackState } from "../../lib/productFeedback";

import { Pressable, StyleSheet, Text } from "react-native";

import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";

/**
 * The way down to the reviews, under the product's name - the website's "Reviews (3)" pill, or
 * "Write a review" while there are none. Only while the shop lets customers comment on it, and
 * the invitation only where a customer could sign in to write one.
 */
export function ReviewsLink({
  state,
  canSignIn,
  onPress,
}: {
  state: ProductFeedbackState;
  canSignIn: boolean;
  onPress: () => void;
}) {
  const { feedback } = state;

  if (!feedback?.allowComments) return null;
  if (feedback.commentCount === 0 && !canSignIn) return null;

  return (
    <Pressable
      accessibilityRole="link"
      style={({ pressed }) => [styles.pill, pressed ? styles.pressed : null]}
      onPress={onPress}
    >
      <Text style={styles.label}>
        {feedback.commentCount > 0
          ? t("feedback.show", { count: feedback.commentCount })
          : t("feedback.leave")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.brandTint,
  },
  pressed: { opacity: 0.7 },
  label: { fontSize: 13, fontWeight: "500", color: colors.brand },
});
