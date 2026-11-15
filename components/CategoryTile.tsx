import type { PublicCategory } from "@estoreclub/app";

import { Pressable, StyleSheet, Text } from "react-native";

import { photoUrl } from "../lib/photo";
import { colors } from "../lib/theme";

import { Photo } from "./Photo";

const WIDTH = 104;

/**
 * A category on the home screen, as the website's "Shop by category" row: its picture on the
 * grey tile, its name under it.
 */
export function CategoryTile({
  category,
  onPress,
}: {
  category: PublicCategory;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      style={({ pressed }) => [styles.tile, pressed ? styles.pressed : null]}
      onPress={onPress}
    >
      <Photo
        contain
        height={72}
        uri={photoUrl(category.media, 72)}
        width={72}
      />
      <Text numberOfLines={1} style={styles.name}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: WIDTH,
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.tile,
  },
  pressed: { opacity: 0.8 },
  name: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "500",
    color: colors.ink,
  },
});
