import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "../../lib/theme";

/** Up to two letters of a name: "Olivia Chen" -> "OC". */
function initialsOf(name: string | null): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/**
 * A commenter's face: their picture where they have one (a Google sign-in brings it), else their
 * initials on a blue tint - the shop's own replies in black, so they stand out down the thread.
 */
export function Avatar({
  name,
  avatarUrl,
  fromShop,
  size,
}: {
  name: string | null;
  avatarUrl: string | null;
  fromShop: boolean;
  size: number;
}) {
  const box = { width: size, height: size, borderRadius: size / 2 };

  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={[styles.photo, box]} />;
  }

  return (
    <View style={[styles.initials, box, fromShop ? styles.shop : null]}>
      <Text
        style={[
          styles.letters,
          { fontSize: size * 0.38 },
          fromShop ? styles.shopLetters : null,
        ]}
      >
        {initialsOf(name) || "·"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { backgroundColor: colors.tile },
  initials: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandTint,
  },
  shop: { backgroundColor: colors.ink },
  letters: { fontWeight: "700", color: colors.ink },
  shopLetters: { color: colors.white },
});
