import type { PublicCategory } from "@estoreclub/app";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { photoUrl } from "../lib/photo";
import { colors } from "../lib/theme";

import { Photo } from "./Photo";

/** The round badge the picture fills. */
const BADGE = 28;

/**
 * A category in the shop's strip, as the website's category bar has it: a pill with the
 * category's small picture and its name. Chosen, it turns white with an ink outline and its name
 * bold - the product pictures are light, and on a black pill they looked pasted on. The picture
 * fills a round badge, cropped to the circle: its own backdrop is the badge, so no photo's square
 * edge shows, whatever grey or white it was shot on.
 */
export function CategoryChip({
  category,
  selected,
  onPress,
}: {
  category: PublicCategory;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? styles.selected : null]}
      onPress={onPress}
    >
      <View style={styles.badge}>
        <Photo
          height={BADGE}
          uri={photoUrl(category.media, BADGE * 2)}
          width={BADGE}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.name, selected ? styles.selectedName : null]}
      >
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingLeft: 5,
    paddingRight: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: colors.tile,
  },
  selected: { backgroundColor: colors.white, borderColor: colors.ink },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  name: { fontSize: 13.5, fontWeight: "500", color: colors.ink },
  selectedName: { fontWeight: "700" },
});
