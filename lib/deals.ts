import type { PublicDiscountRule, PublicProduct } from "@estoreclub/app";

import {
  discounted,
  isRuleOn,
  readDiscount,
  ruleFor,
  toRuleDeal,
  type RuleDeal as ShopRuleDeal,
} from "@estoreclub/storefront";

export { discounted };

/**
 * The shop's discount rules, as a product shows them - the website's own rules, from
 * `@estoreclub/storefront`.
 *
 * The SERVER prices every rule: the bag's discount is its answer, and that is what is charged.
 * This is only the badge and the struck-through price, so a shopper sees the deal before the
 * bag does. Only rules on right now are shown (their dates and weekly windows, checked again
 * here as the app stays open): a rule outside its hours has no badge, as it has no saving.
 *
 * Where no rule saves on a product, its own `DISCOUNT` field does - "8.00" or "20%" off, read as
 * the website and the admin's tiles read it (`readDiscount`).
 */

/**
 * A deal on a product, as the website's (`@estoreclub/storefront`) - with no name for the product's own
 * `DISCOUNT`, which is not a rule.
 */
export type RuleDeal = Omit<ShopRuleDeal, "name"> & { name?: string };

/**
 * The deal on a product right now: the first rule, in the shop's order, that names it or one of its
 * categories and is on at this moment - one badge per product, a photo wearing three deals reads as
 * none - else its own `DISCOUNT`.
 */
export function dealOf(
  product: PublicProduct,
  rules: readonly PublicDiscountRule[],
): RuleDeal | undefined {
  const categoryIds = (product.categories ?? [])
    .filter(Boolean)
    .map((category) => category.id);
  const rule = ruleFor(
    product.id,
    categoryIds,
    rules.filter((each) => isRuleOn(each)),
  );
  const deal = rule ? toRuleDeal(rule, product.price ?? 0) : undefined;

  if (deal) return deal;

  const own = readDiscount(product.settings?.DISCOUNT?.value);

  return own ? { discount: own } : undefined;
}
