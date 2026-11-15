import type { PublicProductComment } from "@estoreclub/app";
import type { ReactNode } from "react";

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { commentDate } from "../../lib/commentDate";
import { messageOf } from "../../lib/errors";
import { useLanguage } from "../../lib/language";
import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";
import { ActionSheet } from "../ActionSheet";

import { Avatar } from "./Avatar";
import { type CommentVoting, CommentVotes } from "./CommentVotes";

/**
 * One comment, read the way a video's are: a face, a name and how long ago, the words, and a thin
 * row of actions under them - the votes, Reply, and Delete for their own. No card around it: the
 * faces down the left edge are what part one comment from the next. The shop's own replies are
 * marked as the store's.
 */
export function CommentItem({
  productId,
  comment,
  voting,
  signedIn,
  onSignIn,
  onReply,
  onRemove,
  children,
}: {
  productId: string;
  comment: PublicProductComment;
  voting: CommentVoting;
  signedIn: boolean;
  /** Absent where the shop signs nobody in: then nothing here is pressable but reading. */
  onSignIn?: () => void;
  /** A root's Reply; absent on a reply - threads are one level deep. */
  onReply?: () => void;
  onRemove: (comment: PublicProductComment) => Promise<void>;
  /** A root's replies, under its words. */
  children?: ReactNode;
}) {
  const { current } = useLanguage();
  const [asking, setAsking] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isReply = Boolean(comment.parentId);
  const { author } = comment;
  // No votes on their own comment - the server refuses one (`own_comment`), so none is offered.
  const votes = voting && !comment.mine;

  const remove = async () => {
    setRemoving(true);
    setError(null);
    try {
      await onRemove(comment);
    } catch (failure) {
      setError(messageOf(failure));
      setRemoving(false);
    }
  };

  return (
    <View style={[styles.item, removing ? styles.removing : null]}>
      <Avatar
        avatarUrl={author.avatarUrl}
        fromShop={author.fromShop}
        name={author.name}
        size={isReply ? 28 : 40}
      />
      <View style={styles.main}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={styles.name}>
            {author.name || t("feedback.anonymous")}
          </Text>
          {author.fromShop ? (
            <View style={styles.shopTag}>
              <Text style={styles.shopTagText}>{t("feedback.fromShop")}</Text>
            </View>
          ) : null}
          <Text style={styles.date}>
            {commentDate(comment.createdAt, current)}
          </Text>
        </View>
        <Text style={styles.body}>{comment.body}</Text>

        {votes || onReply || comment.mine ? (
          <View style={styles.actions}>
            {votes ? (
              <CommentVotes
                comment={comment}
                productId={productId}
                signedIn={signedIn}
                voting={voting}
                onError={(failure) => setError(messageOf(failure))}
                onSignIn={onSignIn}
              />
            ) : null}
            {onReply ? (
              <Action label={t("feedback.reply")} onPress={onReply} />
            ) : null}
            {comment.mine ? (
              <Action
                label={t("feedback.delete")}
                onPress={() => setAsking(true)}
              />
            ) : null}
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {children}
      </View>

      <ActionSheet
        cancelLabel={t("common.cancel")}
        options={[
          { key: "delete", label: t("feedback.delete"), destructive: true },
        ]}
        title={t("feedback.deleteConfirm")}
        visible={asking}
        onClose={() => setAsking(false)}
        onPick={() => void remove()}
      />
    </View>
  );
}

function Action({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => (pressed ? styles.pressed : null)}
      onPress={onPress}
    >
      <Text style={styles.action}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", gap: 12 },
  removing: { opacity: 0.5 },
  main: { flex: 1, minWidth: 0 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flexShrink: 1, fontSize: 14, fontWeight: "700", color: colors.ink },
  shopTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.ink,
  },
  shopTagText: { fontSize: 10.5, fontWeight: "700", color: colors.white },
  date: { fontSize: 12.5, color: colors.muted },
  body: { marginTop: 4, fontSize: 15, lineHeight: 21, color: colors.ink },
  actions: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
  },
  action: { fontSize: 13.5, fontWeight: "600", color: colors.ink },
  pressed: { opacity: 0.6 },
  error: { marginTop: 6, fontSize: 13.5, color: colors.danger },
});
