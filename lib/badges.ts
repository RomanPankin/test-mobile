import type { PublicDiscountRule, PublicProduct } from "@estoreclub/app";

import { dealOf, type RuleDeal } from "./deals";

/**
 * What a product wears on its photo and beside its name - the website's card and dialog, read
 * from the same product fields.
 *
 * Every mark is a product field the shop sets, and a field the shop has switched off never
 * reaches the app (the API leaves it out of `settings`), so each one shows only while the shop
 * uses it and only where it has a value. The customers' stars or likes come from the API only
 * while Sales rules → Social has them vote, and only once somebody has.
 */
export interface ProductBadges {
  /** A discount rule on right now - see `lib/deals.ts`. */
  deal?: RuleDeal;
  /**
   * The shop's word for the product: its own `BADGE` text ("New"), else what it is marked as -
   * best value, best seller, most popular. A key under `badges.` in the app's words when it is
   * one of those, or the shop's own text as it wrote it.
   */
  mark?: { key: MarkKey } | { own: string };
  /** Customers' stars, where the shop has them vote with stars. */
  rating?: { average: number; count: number; max: number };
  /** Customers' likes, where the shop has them vote with likes. */
  likes?: { likes: number; dislikes: number };
}

export type MarkKey = "new" | "bestValue" | "bestSeller" | "popular";

const MARK_KEYS: readonly string[] = [
  "new",
  "bestValue",
  "bestSeller",
  "popular",
];

const flag = (product: PublicProduct, key: string) =>
  product.settings?.[key]?.value === true;

/** A free-text field, trimmed - or nothing, which is what an empty one is. */
function textOf(product: PublicProduct, key: string): string | undefined {
  const value = product.settings?.[key]?.value;

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * The shop's own `BADGE` word, said in the app's language where the app knows it ("New" ->
 * `new`, "Best Value" -> `bestValue`): the field is plain text, in the shop's language only.
 */
function ownMark(word: string): ProductBadges["mark"] {
  const key = word
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, next: string) => next.toUpperCase());

  return MARK_KEYS.includes(key) ? { key: key as MarkKey } : { own: word };
}

export function productBadges(
  product: PublicProduct,
  rules: readonly PublicDiscountRule[],
): ProductBadges {
  const own = textOf(product, "BADGE");
  const mark: ProductBadges["mark"] = own
    ? ownMark(own)
    : flag(product, "BEST_VALUE")
      ? { key: "bestValue" }
      : flag(product, "BEST_SELLER")
        ? { key: "bestSeller" }
        : flag(product, "MOST_POPULAR")
          ? { key: "popular" }
          : undefined;

  return {
    deal: dealOf(product, rules),
    mark,
    ...(product.customerRating?.count
      ? { rating: product.customerRating }
      : {}),
    ...(product.customerLikes &&
    product.customerLikes.likes + product.customerLikes.dislikes > 0
      ? { likes: product.customerLikes }
      : {}),
  };
}

/** Whether the shop marked it as new (`BADGE` "New") - what leads "New arrivals". */
export function isNew(product: PublicProduct): boolean {
  return textOf(product, "BADGE")?.toLowerCase() === "new";
}
