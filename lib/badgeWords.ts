import type { ProductBadges } from "./badges";
import type { RuleDeal } from "./deals";

import { money } from "./money";
import { t } from "./strings";

/** "Save 10%", "Buy 2 get 1 free", "3 for NZ$20.00" - a deal in the app's words. */
export function dealLabel(deal: RuleDeal): string {
  if (deal.discount) {
    return t("badges.save", {
      amount: deal.discount.isPercent
        ? `${deal.discount.amount}%`
        : money(deal.discount.amount),
    });
  }

  const group = deal.group;

  if (!group) return deal.name ?? "";
  if (group.kind === "bundle_price") {
    return t("badges.bundle", {
      count: group.count,
      price: money(group.price),
    });
  }

  return group.price === 0
    ? t("badges.buyGetFree", { buy: group.buy, get: group.get })
    : t("badges.buyGet", {
        buy: group.buy,
        get: group.get,
        price: money(group.price),
      });
}

/** The shop's word for the product: the app's own where it has one, else the shop's text as written. */
export function markLabel(mark: NonNullable<ProductBadges["mark"]>): string {
  return "key" in mark ? t(`badges.${mark.key}`) : mark.own;
}
