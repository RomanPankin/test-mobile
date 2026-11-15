import type { PublicProduct } from "@estoreclub/app";

/** The file the platform keeps of a photo at `width`: `<name>@<width>.webp`. */
function copyUrl(url: string, width: number): string {
  const suffixAt = url.search(/[?#]/);
  const path = suffixAt === -1 ? url : url.slice(0, suffixAt);
  const suffix = suffixAt === -1 ? "" : url.slice(suffixAt);
  const nameStart = path.lastIndexOf("/") + 1;
  const dot = path.lastIndexOf(".");
  const stem = dot > nameStart ? path.slice(0, dot) : path;

  return `${stem}@${width}.webp${suffix}`;
}

/**
 * A row's first photo at a size worth downloading for `points` on screen (at twice that, for a
 * phone's pixels): the narrowest resized copy that covers it, else the original.
 */
export function photoUrl(
  media: PublicProduct["media"],
  points: number,
): string | null {
  const first = media?.find((item) => item.type !== "video") ?? media?.[0];

  if (!first) return null;

  const widths = [...(first.variants ?? [])].sort((a, b) => a - b);
  const fit = widths.find((width) => width >= points * 2);

  return fit ? copyUrl(first.url, fit) : first.url;
}
