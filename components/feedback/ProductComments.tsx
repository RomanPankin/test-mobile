import type { ProductFeedbackState } from "../../lib/productFeedback";

import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { t } from "../../lib/strings";
import { colors, heading } from "../../lib/theme";
import { ActionButton } from "../ActionButton";

import { CommentComposer } from "./CommentComposer";
import { type CommentVoting } from "./CommentVotes";
import { CommentThread } from "./CommentThread";

/**
 * What customers say about the product, at the foot of its screen: how many, the line to write on,
 * then the newest comments, ten at a time.
 *
 * Follows the shop's rules (Sales rules → Social) as the server reads them for THIS product - a
 * product can opt out with its own fields: nothing until they are read, nothing while
 * `allowComments` is off, and votes on a comment only while `allowCommentVotes` is on, the way
 * `commentVoting` says. Where the shop signs nobody in, the thread is only read.
 */
export function ProductComments({
  productId,
  state,
  canSignIn,
  onSignIn,
}: {
  productId: string;
  state: ProductFeedbackState;
  canSignIn: boolean;
  onSignIn: () => void;
}) {
  const { feedback, comments, hasNext, loading, signedIn } = state;

  if (!feedback?.allowComments) return null;

  const voting: CommentVoting =
    !feedback.allowCommentVotes || feedback.commentVoting === "off"
      ? null
      : {
          // `up` (a like only) is the like without its dislike.
          kind: feedback.commentVoting === "range" ? "range" : "like",
          likeOnly: feedback.commentVoting === "up",
          // 5 where the server leaves it out - the default scale.
          stars: feedback.commentStars || 5,
        };
  const signIn = canSignIn ? onSignIn : undefined;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.title}>{t("feedback.title")}</Text>
        {feedback.commentCount > 0 ? (
          <Text style={styles.count}>
            {t("feedback.count", { count: feedback.commentCount })}
          </Text>
        ) : null}
      </View>

      {canSignIn && signedIn !== null ? (
        <CommentComposer
          placeholder={t("feedback.placeholder")}
          signedIn={signedIn}
          submitLabel={t("feedback.post")}
          onSignIn={onSignIn}
          onSubmit={state.post}
        />
      ) : null}

      {comments.length === 0 ? (
        // No comments yet: nothing said about it - the form above is the invitation.
        loading ? (
          <ActivityIndicator color={colors.ink} style={styles.spinner} />
        ) : null
      ) : (
        <View style={styles.list}>
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              productId={productId}
              signedIn={Boolean(signedIn)}
              voting={voting}
              onCount={(delta) => state.countReply(comment.id, delta)}
              onRemove={state.remove}
              onSignIn={signIn}
            />
          ))}
        </View>
      )}

      {hasNext ? (
        <View style={styles.more}>
          <ActionButton
            busy={loading}
            label={t("feedback.more")}
            tone="quiet"
            onPress={() => void state.loadMore().catch(() => {})}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
    paddingTop: 24,
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  heading: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
  },
  title: { ...heading, fontSize: 22, color: colors.ink },
  count: { fontSize: 13, color: colors.muted },
  spinner: { alignSelf: "flex-start" },
  list: { gap: 22 },
  more: { alignItems: "center" },
});
