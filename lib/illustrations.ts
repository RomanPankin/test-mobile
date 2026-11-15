/**
 * The pictures the app falls back on where the shop has chosen none - the sample's own media,
 * served beside its product photos, the same files the website's `lib/content/defaults.ts`
 * names. A shop picks its own in "App\Images" (or, for the hero, the website's "Site images").
 */
const MEDIA =
  "https://estoreclub-public-dev.s3.ap-southeast-2.amazonaws.com/sample-tech/v1.0/media";

/**
 * Bumped whenever a picture below is replaced under the same name: sample media is served as
 * immutable for a year, so a phone or browser that has the old file keeps showing it - the new
 * address (`?v=`) is one no cache has seen. Storage ignores the query.
 */
const VERSION = "2026-11-13";

const file = (name: string) => `${MEDIA}/${name}?v=${VERSION}`;

export const illustrations = {
  /** The phone floating on the grey band that opens the home screen (`hero`). */
  hero: file("hero.webp"),
  /** An open, empty parcel: no orders yet (`orders.empty`). */
  noOrders: file("empty-orders.webp"),
  /** The sealed parcels over "Delivery & returns" (`delivery.hero`). */
  delivery: file("delivery-hero.webp"),
  /** The desk with a phone, a tablet and headphones over "About us" (`about.story`). */
  about: file("about-story.webp"),
};
