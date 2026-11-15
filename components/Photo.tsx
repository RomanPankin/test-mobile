import { Image, StyleSheet, View } from "react-native";

import { colors } from "../lib/theme";

/**
 * A picture at an explicit size, or a quiet grey tile of the same size where there is none.
 * `contain`: a product photo, shot on the tile's own grey, shown whole rather than cropped -
 * the website draws its cards that way too.
 */
export function Photo({
  uri,
  width,
  height,
  radius = 0,
  contain = false,
  fadeDuration,
}: {
  uri: string | null | undefined;
  width: number;
  height: number;
  radius?: number;
  contain?: boolean;
  /** Android fades a picture in by default, even one already downloaded. */
  fadeDuration?: number;
}) {
  const box = { width, height, borderRadius: radius };

  return uri ? (
    <Image
      fadeDuration={fadeDuration}
      resizeMode={contain ? "contain" : "cover"}
      source={{ uri }}
      style={[contain ? styles.clear : styles.photo, box]}
    />
  ) : (
    <View style={[styles.photo, box]} />
  );
}

const styles = StyleSheet.create({
  photo: { backgroundColor: colors.tile },
  clear: { backgroundColor: "transparent" },
});
