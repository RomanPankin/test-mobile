import type { ProductFeedbackState } from "../../lib/productFeedback";

import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { messageOf } from "../../lib/errors";
import { colors } from "../../lib/theme";

import { StarVotes } from "./StarVotes";
import { ThumbVotes } from "./ThumbVotes";

/**
 * The customers' votes on the product, under its name, and the place to cast one - the shop's way
 * (Sales rules → Social, `productVoting`): stars for `range`, a like and a dislike for `like`, a
 * like alone for `up`. Nothing while the product takes no votes. A guest pressing one is asked to
 * sign in first; nothing is sent for them.
 */
export function RatingLine({
  state,
  canSignIn,
  onSignIn,
}: {
  state: ProductFeedbackState;
  /** The shop signs customers in: otherwise the votes are only read. */
  canSignIn: boolean;
  onSignIn: () => void;
}) {
  const { feedback, signedIn, rate } = state;
  const [error, setError] = useState<string | null>(null);

  if (!feedback || !feedback.allowRating || feedback.productVoting === "off") {
    return null;
  }

  const vote = canSignIn
    ? (value: number) => {
        setError(null);
        if (!signedIn) {
          onSignIn();

          return;
        }
        rate(value).catch((failure: unknown) => setError(messageOf(failure)));
      }
    : undefined;
  const { rating } = feedback;

  return (
    <View style={styles.line}>
      {feedback.productVoting === "range" ? (
        <StarVotes
          average={rating.average}
          count={rating.count}
          max={rating.max}
          mine={rating.mine}
          onVote={vote}
        />
      ) : (
        <ThumbVotes
          dislikes={rating.dislikes}
          likeOnly={feedback.productVoting === "up"}
          likes={rating.likes}
          mine={rating.mine}
          onVote={vote}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  line: { marginTop: 12, gap: 6 },
  error: { fontSize: 13.5, color: colors.danger },
});
