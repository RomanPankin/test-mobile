import {
  createProductComment,
  deleteProductComment,
  getProductComments,
  getProductFeedback,
  isSignedIn,
  rateProduct,
  unrateProduct,
  type PublicProductComment,
  type PublicProductFeedback,
} from "@estoreclub/app";
import { useCallback, useEffect, useState } from "react";

import { animateFold } from "./animateFold";

/**
 * One product's feedback, for its screen - the website's `lib/productComments.ts`, on the app's SDK.
 *
 * What the product takes is the shop's to say (Sales rules → Social, narrowed by the product's own
 * fields), and the server says it in `getProductFeedback`: the screen draws only what that
 * allows. The roots are read a page at a time; a root's replies only when someone opens them
 * (`useReplies`) - most are never opened.
 *
 * Every read goes as the signed-in customer when there is one (the SDK sends the token), which
 * is what marks their own comments `mine` and their own vote. So signing in reads it all again.
 */

const PAGE_SIZE = 10;

export interface ProductFeedbackState {
  /** Null until read, and when it could not be: then nothing of it is drawn. */
  feedback: PublicProductFeedback | null;
  comments: PublicProductComment[];
  hasNext: boolean;
  loading: boolean;
  /** Whether a customer is signed in - null until known. Writing asks them to first. */
  signedIn: boolean | null;
  /** They have just signed in: read again as them. */
  signedInNow: () => void;
  loadMore: () => Promise<void>;
  /** A new root, put at the top. Rejects with the server's refusal. */
  post: (body: string) => Promise<void>;
  /** A root of their own, with its replies. */
  remove: (comment: PublicProductComment) => Promise<void>;
  /** A reply was added under a root (1), or taken away (-1). */
  countReply: (rootId: string, delta: number) => void;
  /** Their vote on the product; the same vote again takes it back. */
  rate: (value: number) => Promise<void>;
}

/** `productId` empty: nothing is read - the screen has no product yet. */
export function useProductFeedback(productId: string): ProductFeedbackState {
  const [feedback, setFeedback] = useState<PublicProductFeedback | null>(null);
  const [comments, setComments] = useState<PublicProductComment[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  // Moved on signing in: the reads below run again, as the customer.
  const [viewer, setViewer] = useState(0);

  useEffect(() => {
    if (!productId) return;

    let live = true;

    setLoading(true);
    (async () => {
      try {
        const [info, signed] = await Promise.all([
          getProductFeedback({ productId }),
          isSignedIn(),
        ]);

        if (!live) return;
        // It arrives after the screen has drawn: the votes ease in, and what is under them moves.
        animateFold();
        setFeedback(info);
        setSignedIn(signed);

        if (!info.allowComments) {
          setComments([]);
          setHasNext(false);

          return;
        }

        const first = await getProductComments({
          productId,
          limit: PAGE_SIZE,
        });

        if (!live) return;
        setComments(first.data);
        setHasNext(first.pagination.hasNext);
        setPage(1);
      } catch {
        // Unreachable, or refused: the product is still for sale - its feedback is simply not drawn.
        if (live) setFeedback(null);
      } finally {
        if (live) setLoading(false);
      }
    })();

    return () => {
      live = false;
    };
  }, [productId, viewer]);

  const signedInNow = useCallback(() => {
    setSignedIn(true);
    setViewer((count) => count + 1);
  }, []);

  const loadMore = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getProductComments({
        productId,
        page: page + 1,
        limit: PAGE_SIZE,
      });

      // A comment posted since the first page shifts the pages by one: what is shown is dropped.
      setComments((shown) => [
        ...shown,
        ...next.data.filter((c) => !shown.some((s) => s.id === c.id)),
      ]);
      setHasNext(next.pagination.hasNext);
      setPage(page + 1);
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  const post = useCallback(
    async (body: string) => {
      const comment = await createProductComment({ productId, body });

      setComments((shown) => [comment, ...shown]);
      setFeedback((info) =>
        info ? { ...info, commentCount: info.commentCount + 1 } : info,
      );
    },
    [productId],
  );

  const remove = useCallback(
    async (comment: PublicProductComment) => {
      await deleteProductComment({ productId, commentId: comment.id });

      setComments((shown) => shown.filter((c) => c.id !== comment.id));
      // A root goes with its replies, and the count counted them all.
      setFeedback((info) =>
        info
          ? {
              ...info,
              commentCount: Math.max(
                0,
                info.commentCount - 1 - comment.replyCount,
              ),
            }
          : info,
      );
    },
    [productId],
  );

  const countReply = useCallback((rootId: string, delta: number) => {
    setComments((shown) =>
      shown.map((c) =>
        c.id === rootId
          ? { ...c, replyCount: Math.max(0, c.replyCount + delta) }
          : c,
      ),
    );
    setFeedback((info) =>
      info
        ? { ...info, commentCount: Math.max(0, info.commentCount + delta) }
        : info,
    );
  }, []);

  const rate = useCallback(
    async (value: number) => {
      const rating =
        feedback?.rating.mine === value
          ? await unrateProduct({ productId })
          : await rateProduct({ productId, value });

      setFeedback((info) => (info ? { ...info, rating } : info));
    },
    [productId, feedback?.rating.mine],
  );

  return {
    feedback,
    comments,
    hasNext,
    loading,
    signedIn,
    signedInNow,
    loadMore,
    post,
    remove,
    countReply,
    rate,
  };
}

export interface RepliesState {
  replies: PublicProductComment[];
  hasNext: boolean;
  loading: boolean;
  /** The first page on the first call, the next one after. */
  load: () => Promise<void>;
  post: (body: string) => Promise<void>;
  remove: (reply: PublicProductComment) => Promise<void>;
}

/** One root's replies, oldest first - read when the customer opens them. */
export function useReplies(
  productId: string,
  rootId: string,
  onCount: (delta: number) => void,
): RepliesState {
  const [replies, setReplies] = useState<PublicProductComment[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getProductComments({
        productId,
        parentId: rootId,
        page: page + 1,
        limit: PAGE_SIZE,
      });

      setReplies((shown) => [
        ...shown,
        ...next.data.filter((r) => !shown.some((s) => s.id === r.id)),
      ]);
      setHasNext(next.pagination.hasNext);
      setPage(page + 1);
    } finally {
      setLoading(false);
    }
  }, [productId, rootId, page]);

  const post = useCallback(
    async (body: string) => {
      const reply = await createProductComment({
        productId,
        body,
        parentId: rootId,
      });

      // Oldest first, so a new one goes last - where the conversation goes on.
      setReplies((shown) => [...shown, reply]);
      onCount(1);
    },
    [productId, rootId, onCount],
  );

  const remove = useCallback(
    async (reply: PublicProductComment) => {
      await deleteProductComment({ productId, commentId: reply.id });

      setReplies((shown) => shown.filter((r) => r.id !== reply.id));
      onCount(-1);
    },
    [productId, onCount],
  );

  return { replies, hasNext, loading, load, post, remove };
}
