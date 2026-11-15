import type { PublicProduct } from "@estoreclub/app";
import type { Catalogue } from "./catalogue";

import { isNew } from "./badges";
import { isSoldOut } from "./colours";
import { dealOf } from "./deals";

/** As many as a band on the home screen shows; the rest are in the Shop tab. */
const BAND = 8;

/**
 * The home screen's "New arrivals": what the shop marked "New", then whatever sells most - so a
 * shop that has marked nothing still has a band. Sold out goes last: a band's first card is the
 * one a shopper is most likely to tap.
 */
export function newArrivals(catalogue: Catalogue): PublicProduct[] {
  const ranked = [...catalogue.products].sort(
    (a, b) => (a.popularRank ?? Infinity) - (b.popularRank ?? Infinity),
  );
  const picked = [...new Set([...catalogue.products.filter(isNew), ...ranked])];

  return [
    ...picked.filter((product) => !isSoldOut(product)),
    ...picked.filter(isSoldOut),
  ].slice(0, BAND);
}

/** Every product a discount rule (or its own `DISCOUNT`) is on right now - the deals band. */
export function dealProducts(catalogue: Catalogue): PublicProduct[] {
  return catalogue.products
    .filter(
      (product) => dealOf(product, catalogue.rules) && !isSoldOut(product),
    )
    .slice(0, BAND);
}
