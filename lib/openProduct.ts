import type { PublicProduct } from "@estoreclub/app";

import { router } from "expo-router";
import { Dimensions, Image } from "react-native";

import { photoUrl } from "./photo";

/** How long a tap may wait for the photo: on a slow network the product opens without it. */
const MAX_WAIT_MS = 500;

const preloaded = new Map<string, Promise<unknown>>();
let opening = false;

/** The product screen's big photo, a larger file than the list's: fetched once per photo. */
function preloadPhoto(product: PublicProduct): Promise<unknown> {
  const uri = photoUrl(product.media, Dimensions.get("window").width);

  if (!uri) return Promise.resolve();

  let photo = preloaded.get(uri);

  if (!photo) {
    // A failure is forgotten, to be tried again; the product still opens, on its plain tile.
    photo = Image.prefetch(uri).catch(() => preloaded.delete(uri));
    preloaded.set(uri, photo);
  }

  return photo;
}

/** Opens a product once its photo is in hand, so the screen slides in with the picture on it. */
export async function openProduct(
  product: PublicProduct,
  /** The colour picked on the card, for the screen to open on. */
  colourId?: string | null,
): Promise<void> {
  // A second tap while the first waits for the photo would open the product twice.
  if (opening) return;
  opening = true;

  try {
    await Promise.race([
      preloadPhoto(product),
      new Promise((done) => setTimeout(done, MAX_WAIT_MS)),
    ]);
    router.push(
      colourId
        ? `/product/${product.id}?colour=${colourId}`
        : `/product/${product.id}`,
    );
  } finally {
    opening = false;
  }
}
