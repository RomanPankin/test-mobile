import type { PublicCombo, PublicProduct } from "@estoreclub/app";

import { hexFor, isSoldOut, productColours, type Colour } from "./colours";
import { photoUrl } from "./photo";

/**
 * Bundles - the shop's combos, as TechStore sells them: "Phone 16 Pro Starter Kit", a phone with
 * its case and charger for one price. The website's `lib/bundle.ts`, on the app's SDK.
 *
 * A bundle is slots ("Your phone", "Your case"), each filled from a list of products. Where an
 * option leaves the variant open, the shopper picks one - here that is a COLOUR, since a
 * product's colours are its variants.
 */

/** A place's way to fill it - the SDK names the combo, not its parts. */
export type ComboSlot = PublicCombo["slots"][number];
export type ComboOption = ComboSlot["options"][number];

/** One filled place: which option, and - where the option leaves it open - which colour. */
export interface BundleChoice {
  option: ComboOption;
  colourId?: string;
}

/** One place to fill. A slot taking two of something is two places, keyed `slotId:n`. */
export interface BundlePlace {
  key: string;
  slotId: string;
  name: string;
}

type Products = ReadonlyMap<string, PublicProduct>;

export function productsById(products: readonly PublicProduct[]): Products {
  return new Map(products.map((product) => [product.id, product]));
}

export function placesOf(combo: PublicCombo): BundlePlace[] {
  return combo.slots.flatMap((slot) =>
    Array.from({ length: Math.max(1, slot.quantity) }, (_, index) => ({
      key: `${slot.id}:${index}`,
      slotId: slot.id,
      name: slot.name,
    })),
  );
}

/**
 * The colours a shopper chooses between for this option - none when the option names its own
 * variant. Each wears the catalogue's swatch; the combo answers only names.
 */
export function openColours(
  option: ComboOption,
  product: PublicProduct | undefined,
  hexOf: ReadonlyMap<string, string>,
): Colour[] {
  if (option.variantId !== null) return [];

  const known = product ? productColours(product, hexOf) : [];

  return (option.variants ?? []).map((variant) => {
    const colour = known.find((item) => item.id === variant.id);

    return {
      id: variant.id,
      name: variant.name,
      hex: colour?.hex ?? hexFor(hexOf, variant.name),
      price: colour?.price ?? product?.price ?? 0,
      available: variant.isAvailable && (colour?.available ?? true),
    };
  });
}

/** Whether an option can be picked at all: its product is on sale, in some colour. */
export function optionAvailable(
  option: ComboOption,
  product: PublicProduct | undefined,
  hexOf: ReadonlyMap<string, string>,
): boolean {
  if (!product || isSoldOut(product)) return false;

  const colours = openColours(option, product, hexOf);

  return colours.length === 0 || colours.some((colour) => colour.available);
}

/** A choice to start a place on: the option, in its first colour on sale. */
export function choose(
  option: ComboOption,
  product: PublicProduct | undefined,
  hexOf: ReadonlyMap<string, string>,
): BundleChoice {
  const colour = openColours(option, product, hexOf).find(
    (item) => item.available,
  );

  return colour ? { option, colourId: colour.id } : { option };
}

/** The first choice of every place: its first option on sale, in its first colour on sale. */
export function firstChoices(
  combo: PublicCombo,
  products: Products,
  hexOf: ReadonlyMap<string, string>,
): Record<string, BundleChoice> {
  const choices: Record<string, BundleChoice> = {};

  for (const place of placesOf(combo)) {
    const slot = combo.slots.find((item) => item.id === place.slotId);
    const option = slot?.options.find((item) =>
      optionAvailable(item, products.get(item.productId), hexOf),
    );

    if (option) {
      choices[place.key] = choose(
        option,
        products.get(option.productId),
        hexOf,
      );
    }
  }

  return choices;
}

/** The variant a choice is bought in - the option's own, or the colour picked - or none. */
export function variantOf(choice: BundleChoice): string | undefined {
  return choice.option.variantId ?? choice.colourId;
}

/** Whether every place is filled with something on sale, in a colour where it needs one. */
export function bundleReady(
  combo: PublicCombo,
  choices: Record<string, BundleChoice>,
  products: Products,
  hexOf: ReadonlyMap<string, string>,
): boolean {
  return placesOf(combo).every((place) => {
    const choice = choices[place.key];
    const product = choice ? products.get(choice.option.productId) : undefined;

    if (!choice || !optionAvailable(choice.option, product, hexOf))
      return false;

    const colours = openColours(choice.option, product, hexOf);

    return (
      colours.length === 0 ||
      colours.some(
        (colour) => colour.id === choice.colourId && colour.available,
      )
    );
  });
}

/** A pick's own price, as the server reads it for the two "off" kinds. */
function pickPrice(choice: BundleChoice, products: Products): number {
  const product = products.get(choice.option.productId);
  const variantId = variantOf(choice);

  if (!product) return 0;

  return (
    product.variants?.find((variant) => variant.id === variantId)?.price ??
    product.price ??
    0
  );
}

/**
 * What the bundle costs filled this way - the reading the server gives its `priceKind`. A
 * DISPLAY figure: the bag line is priced by the server, and that is what is charged.
 */
export function bundlePrice(
  combo: PublicCombo,
  choices: BundleChoice[],
  products: Products,
): number {
  if (combo.priceKind === "fixed_price") {
    return (
      combo.price +
      choices.reduce((sum, choice) => sum + choice.option.surcharge, 0)
    );
  }

  const apart = choices.reduce(
    (sum, choice) => sum + pickPrice(choice, products),
    0,
  );

  return combo.priceKind === "percent_off"
    ? (apart * (100 - combo.price)) / 100
    : Math.max(0, apart - combo.price);
}

/**
 * What the same things cost bought one by one - the cheapest product of each place at its own
 * price. Beside the bundle's "from" price it is the saving a card can promise; 0 when a product
 * is missing from the catalogue, so no saving is invented.
 */
export function apartPrice(combo: PublicCombo, products: Products): number {
  let total = 0;

  for (const slot of combo.slots) {
    const prices = slot.options.map(
      (option) => products.get(option.productId)?.price,
    );

    if (prices.length === 0 || prices.some((price) => price === undefined)) {
      return 0;
    }
    total += Math.min(...(prices as number[])) * Math.max(1, slot.quantity);
  }

  return total;
}

/** A bundle with a place nothing on sale can fill: shown, but sold out. */
export function bundleSoldOut(
  combo: PublicCombo,
  products: Products,
  hexOf: ReadonlyMap<string, string>,
): boolean {
  return combo.slots.some(
    (slot) =>
      !slot.options.some((option) =>
        optionAvailable(option, products.get(option.productId), hexOf),
      ),
  );
}

/**
 * The bundle's cover at a size worth downloading for `points`: its own photo, else its first
 * pick's - a bundle the shop has not photographed is shown by what is in it.
 */
export function bundleCover(
  combo: PublicCombo,
  products: Products,
  points: number,
): string | null {
  if (combo.images[0]?.url) return combo.images[0].url;

  const first = combo.slots[0]?.options[0];

  return first ? photoUrl(products.get(first.productId)?.media, points) : null;
}

/**
 * What a bundle is, as pictures, when the shop took no photograph of the set: the first product
 * of each place, up to three - a phone, a case and a charger shown side by side, as the website's
 * `BundlePhotos`. Empty where the bundle has its own cover (`bundleCover`).
 */
export function bundleProductPhotos(
  combo: PublicCombo,
  products: Products,
  points: number,
): string[] {
  if (combo.images[0]?.url) return [];

  return combo.slots
    .map((slot) => {
      const first = slot.options[0];

      return first
        ? photoUrl(products.get(first.productId)?.media, points)
        : null;
    })
    .filter((url): url is string => !!url)
    .slice(0, 3);
}

/** One product the bundle fills, and the place it fills ("Your phone"). */
export interface BundleItem {
  product: PublicProduct;
  place: string;
}

/**
 * What is in the bundle, to describe under it - the website's `BundleDetails`: per slot, the
 * product picked for its first place, else the slot's first product. A slot offering two consoles
 * describes only the one chosen, and changes with the pick; a product two slots share is
 * described once.
 */
export function bundleItems(
  combo: PublicCombo,
  choices: Record<string, BundleChoice>,
  products: Products,
): BundleItem[] {
  const seen = new Set<string>();

  return combo.slots.flatMap((slot) => {
    const picked = placesOf(combo).find(
      (place) => place.slotId === slot.id && choices[place.key],
    );
    const productId =
      (picked && choices[picked.key].option.productId) ??
      slot.options.find((option) => products.has(option.productId))?.productId;
    const product = productId ? products.get(productId) : undefined;

    if (!product || seen.has(product.id)) return [];
    seen.add(product.id);

    return [{ product, place: slot.name }];
  });
}
