import type { PublicProductComment } from "@estoreclub/app";

import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useReplies } from "../../lib/productFeedback";
import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";

import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";
import { type CommentVoting } from "./CommentVotes";

/**
 * A root comment and its replies, one level deep. The replies are read only when someone opens
 * them ("3 replies"), a page at a time; Reply opens them too, with the line to write on under
 * the last one - where the conversation goes on.
 */
export function CommentThread({
  productId,
  comment,
  voting,
  signedIn,
  onSignIn,
  onCount,
  onRemove,
}: {
  productId: string;
  comment: PublicProductComment;
  voting: CommentVoting;
  signedIn: boolean;
  onSignIn?: () => void;
  /** A reply was added under this root (1), or taken away (-1). */
  onCount: (delta: number) => void;
  onRemove: (comment: PublicProductComment) => Promise<void>;
}) {
  const replies = useReplies(productId, comment.id, onCount);
  const [open, setOpen] = useState(false);
  const [replying, setReplying] = useState(false);
  const read = replies.replies.length > 0 || replies.hasNext;

  const show = () => {
    setOpen(true);
    if (!read && comment.replyCount > 0) void replies.load().catch(() => {});
  };

  return (
    <CommentItem
      comment={comment}
      productId={productId}
      signedIn={signedIn}
      voting={voting}
      onRemove={onRemove}
      onReply={
        onSignIn
          ? () => {
              if (!signedIn) {
                onSignIn();

                return;
              }
              show();
              setReplying(true);
            }
          : undefined
      }
      onSignIn={onSignIn}
    >
      {comment.replyCount > 0 ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={6}
          style={styles.toggle}
          onPress={() => (open ? setOpen(false) : show())}
        >
          <Text style={styles.toggleText}>
            {open
              ? t("feedback.hideReplies")
              : t("feedback.replies", { count: comment.replyCount })}
          </Text>
        </Pressable>
      ) : null}

      {open ? (
        <View style={styles.replies}>
          {replies.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              productId={productId}
              signedIn={signedIn}
              voting={voting}
              onRemove={replies.remove}
              onSignIn={onSignIn}
            />
          ))}
          {replies.loading ? (
            <ActivityIndicator color={colors.ink} style={styles.spinner} />
          ) : replies.hasNext ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => void replies.load().catch(() => {})}
            >
              <Text style={styles.toggleText}>{t("feedback.moreReplies")}</Text>
            </Pressable>
          ) : null}
          {replying && signedIn && onSignIn ? (
            <CommentComposer
              focusOnMount
              placeholder={t("feedback.replyPlaceholder")}
              signedIn={signedIn}
              submitLabel={t("feedback.reply")}
              onSignIn={onSignIn}
              onSubmit={async (body) => {
                await replies.post(body);
                setReplying(false);
              }}
            />
          ) : null}
        </View>
      ) : null}
    </CommentItem>
  );
}

const styles = StyleSheet.create({
  toggle: { marginTop: 10, alignSelf: "flex-start" },
  toggleText: { fontSize: 13.5, fontWeight: "700", color: colors.brand },
  replies: { marginTop: 14, gap: 16 },
  spinner: { alignSelf: "flex-start" },
});
