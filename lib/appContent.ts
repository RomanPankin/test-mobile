import type { PublicDictionary } from "@estoreclub/app";

import type { Words } from "./words/en";

import { illustrations } from "./illustrations";

/**
 * The app's own words and pictures, as the shop keeps them in its dashboard: two lists in an
 * "App" folder (a backslash in a list's name is a folder level), read by IDENTIFIER - a name
 * is translated on its way out of the API, a handle is not.
 *
 *   - **App\Texts** (`app_texts`) - one entry per sentence: the entry's name IS the text, so it
 *     is translated like any name, and its `KEY` says where it goes (`product.colours.one`).
 *   - **App\Images** (`app_images`) - `KEY` + `IMAGE`: `hero`, `logo`, `orders.empty`,
 *     `delivery.hero`, `about.story`.
 *
 * Both are optional: whatever a shop has not written falls back to the app's built-in words and
 * pictures, and the pictures first to the website's "Site\Site images" under the same key.
 */
export const APP_LISTS = {
  texts: "app_texts",
  images: "app_images",
  siteImages: "site_site_images",
} as const;

/** The pictures the app draws that are the shop's to choose. */
export interface AppImages {
  /** The phone on the grey band that leads the home screen. */
  hero: string;
  /** Signs the sign-in screen. */
  logo: string | null;
  /** An account with no orders yet. */
  noOrders: string;
  /** Over "Delivery & returns". */
  delivery: string;
  /** Over "About us". */
  about: string;
}

type Lists = ReadonlyMap<string, PublicDictionary>;

const str = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

/** The first picture under `key` in a list, or nothing. */
function imageIn(
  list: PublicDictionary | undefined,
  key: string,
): string | null {
  const entry = list?.entries.find((item) => str(item.values?.KEY) === key);

  return str(entry?.values?.IMAGE) || null;
}

/** The shop's "App\Texts", key → text, in the language they were read in. */
export function appTextsOf(lists: Lists): Words {
  const texts: Record<string, string> = {};

  for (const entry of lists.get(APP_LISTS.texts)?.entries ?? []) {
    const key = str(entry.values?.KEY);

    // A blank name is a sentence the shop has not written: the built-in one stands.
    if (key && entry.name?.trim()) texts[key] = entry.name;
  }

  return texts;
}

export function appImagesOf(lists: Lists): AppImages {
  const own = lists.get(APP_LISTS.images);
  const site = lists.get(APP_LISTS.siteImages);

  return {
    hero: imageIn(own, "hero") ?? imageIn(site, "hero") ?? illustrations.hero,
    logo: imageIn(own, "logo") ?? imageIn(site, "logo"),
    noOrders: imageIn(own, "orders.empty") ?? illustrations.noOrders,
    delivery:
      imageIn(own, "delivery.hero") ??
      imageIn(site, "delivery.hero") ??
      illustrations.delivery,
    about:
      imageIn(own, "about.story") ??
      imageIn(site, "about.story") ??
      illustrations.about,
  };
}
