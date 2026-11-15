import type { PublicProductComment } from "@estoreclub/app";

import { voteProductComment } from "@estoreclub/app";
import { useState } from "react";

import { StarVotes } from "./StarVotes";
import { ThumbVotes } from "./ThumbVotes";

/** How the shop lets customers vote on a comment (`commentVoting`) - null while it does not. */
export type CommentVoting = {
  kind: "like" | "range";
  stars: number;
  /** Likes only (`up`): no dislike. */
  likeOnly: boolean;
} | null;

type Votes = Pick<
  PublicProductComment,
  "likes" | "dislikes" | "ratingAverage" | "ratingCount" | "myVote"
>;

/** The counts as they will be once a like, a dislike or a take-back (0) has gone through. */
function likedAs(votes: Votes, value: number): Votes {
  const was = votes.myVote;

  return {
    ...votes,
    likes: votes.likes - (was === 1 ? 1 : 0) + (value === 1 ? 1 : 0),
    dislikes: votes.dislikes - (was === -1 ? 1 : 0) + (value === -1 ? 1 : 0),
    myVote: value,
  };
}

/**
 * The votes on one comment, the shop's way. Kept here and replaced by the server's answer to
 * each vote; their own vote pressed again takes it back (0). A guest is sent to sign in.
 */
export function CommentVotes({
  productId,
  comment,
  voting,
  signedIn,
  onSignIn,
  onError,
}: {
  productId: string;
  comment: PublicProductComment;
  voting: NonNullable<CommentVoting>;
  signedIn: boolean;
  /** Absent where the shop signs nobody in: the votes are then only read. */
  onSignIn?: () => void;
  onError: (failure: unknown) => void;
}) {
  const [votes, setVotes] = useState<Votes>(comment);

  const vote = onSignIn
    ? (value: number) => {
        if (!signedIn) {
          onSignIn();

          return;
        }

        const next = votes.myVote === value ? 0 : value;
        const before = votes;

        // A like answers at once - counted here before the server has, put back if it refuses.
        // Stars wait for the server: the average is its to work out.
        if (voting.kind === "like") setVotes(likedAs(before, next));

        voteProductComment({ productId, commentId: comment.id, value: next })
          .then(setVotes)
          .catch((failure: unknown) => {
            setVotes(before);
            onError(failure);
          });
      }
    : undefined;

  return voting.kind === "like" ? (
    <ThumbVotes
      dislikes={votes.dislikes}
      likeOnly={voting.likeOnly}
      likes={votes.likes}
      mine={votes.myVote}
      size="sm"
      onVote={vote}
    />
  ) : (
    <StarVotes
      average={votes.ratingAverage}
      count={votes.ratingCount}
      max={voting.stars}
      mine={votes.myVote}
      // The average beside the stars once somebody voted; "no ratings yet" on every comment
      // would be noise.
      showCount={votes.ratingCount > 0}
      size="sm"
      onVote={vote}
    />
  );
}
