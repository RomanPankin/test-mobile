import { Platform, type TextStyle } from "react-native";

/**
 * The TechStore palette, by role - the same colours as the website's `globals.css`: a white
 * page, product photos on a cool grey tile, near-black type and buttons, one blue accent for
 * links and money off.
 */
export const colors = {
  /** Type, and the black buttons that add to the bag and pay. */
  ink: "#111216",
  inkPressed: "#000000",
  /** Running text: softer than the headings. */
  body: "#3a3f4c",
  muted: "#858a94",
  line: "#e8eaee",
  page: "#ffffff",
  /** The grey product photos are shot on: cards, tiles, empty picture boxes. */
  tile: "#f4f6f8",
  /** The hero band's own grey, a touch deeper than the tiles. */
  band: "#e7ebf1",
  card: "#ffffff",
  white: "#ffffff",
  /** The one accent: links, the selected tab, deals. */
  brand: "#0a63ee",
  brandHover: "#0752c8",
  brandTint: "#e8f0fe",
  /** Something went wrong, or cannot be had: a refusal, sold out, cancelled. */
  danger: "#d92d20",
  /** The customers' stars. */
  star: "#f5a524",
  /** A button that cannot be pressed (sold out): the website's `#c9ccd2`. */
  disabled: "#c9ccd2",
};

/**
 * The website sets Inter, falling back to the system's grotesque; a phone draws its own (San
 * Francisco, Roboto) - close enough to Inter, and a bundled face would need `expo-font`, which an
 * app here may not import yet.
 */
export const font = Platform.select({
  ios: "System",
  android: "sans-serif",
  default:
    "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
});

/** A heading's face: semibold and drawn in tight, as the website's titles are. */
export const heading: TextStyle = {
  fontFamily: font,
  fontWeight: "600",
  letterSpacing: -0.4,
};

export const GUTTER = 20;
