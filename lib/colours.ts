import type { PublicDictionary, PublicProduct } from "@estoreclub/app";

/**
 * A product's colours - the website's `lib/toProduct.ts`, on the app's SDK.
 *
 * Each product is sold in colours, and each colour is one of its VARIANTS: the variant's name is
 * the colour's name, and the variant is what the bag is sent. The swatch comes from the shop's
 * `Catalog\Colours` list (`HEX`), matched by that name - both come back in the app's language,
 * so they still match in Russian.
 */
export const COLOURS_LIST = "catalog_colours";

/** A colour the list does not know: a neutral grey rather than no swatch at all. */
const FALLBACK_HEX = "#c8c8cc";

export interface Colour {
  /** The product variant this colour is - what the bag is sent. */
  id: string;
  /** "Black Titanium", in the app's language. */
  name: string;
  hex: string;
  price: number;
  available: boolean;
  /** The colour's own picture, where the shop gave it one (`variant.image`). */
  image?: string;
}

/** The swatches of the colours list, by the colour's name in lower case. */
export function coloursOf(
  list: PublicDictionary | undefined,
): Map<string, string> {
  const hexOf = new Map<string, string>();

  for (const entry of list?.entries ?? []) {
    const hex = entry.values?.HEX;

    if (typeof hex === "string" && hex.trim()) {
      hexOf.set(entry.name.trim().toLowerCase(), hex.trim());
    }
  }

  return hexOf;
}

export function hexFor(
  hexOf: ReadonlyMap<string, string>,
  name: string | null | undefined,
): string {
  return hexOf.get((name ?? "").trim().toLowerCase()) ?? FALLBACK_HEX;
}

export function productColours(
  product: PublicProduct,
  hexOf: ReadonlyMap<string, string>,
): Colour[] {
  const own = product.price ?? 0;

  return (product.variants ?? []).map((variant) => ({
    id: variant.id,
    name: variant.name ?? "",
    hex: hexFor(hexOf, variant.name),
    price: typeof variant.price === "number" ? variant.price : own,
    available: variant.isAvailable !== false,
    ...(variant.image ? { image: variant.image } : {}),
  }));
}

/** The colour a product opens on: its first on sale, else its first. */
export function firstColour(colours: Colour[]): Colour | undefined {
  return colours.find((colour) => colour.available) ?? colours[0];
}

/**
 * None left to sell: the shop counts its stock and this one is at zero (the API's `soldOut`),
 * or every colour it comes in is off sale. Shown, never hidden: a sold-out phone still tells a
 * shopper the shop sells it.
 */
export function isSoldOut(product: PublicProduct): boolean {
  const variants = product.variants ?? [];

  return (
    product.soldOut === true ||
    (variants.length > 0 &&
      variants.every((variant) => variant.isAvailable === false))
  );
}

/**
 * The string a bag line is stored with. The colour travels as the line's `variantId`, which says
 * it better than any text could; this only has to be the same for the same line every time, so
 * a second tap on a colour adds to its line rather than opening another.
 */
export const PLAIN_VARIANT = JSON.stringify({ size: "", extras: [] });

/** A picture's file, whatever size or host it is asked at - `phone-16@512.webp` is `phone-16`. */
const fileOf = (url: string | undefined) =>
  (url ?? "")
    .split("?")[0]
    .split("/")
    .pop()
    ?.replace(/@\d+(?=\.)/, "") ?? "";

/**
 * The photos a product shows in a colour, as the website's product page: a colour with a picture of
 * its own shows it; the colour the product's own photos show (its picture IS the cover) - or one
 * with none - shows them all, every view of it.
 */
export function photosInColour(
  media: PublicProduct["media"],
  colour: Colour | undefined,
): PublicProduct["media"] {
  const photos = (media ?? []).filter(
    (item) => item?.url && item.type !== "video",
  );

  if (!colour?.image || fileOf(colour.image) === fileOf(photos[0]?.url)) {
    return media;
  }

  return [
    { ...(photos[0] ?? {}), url: colour.image, type: "image" },
  ] as PublicProduct["media"];
}
