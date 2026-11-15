import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "../lib/theme";

const SIZE = 46;

/**
 * The shop's mark: its own picture, else the website's - a black rounded square with the
 * name's first letter, as the header's wordmark starts.
 */
export function Logo({ image, name }: { image: string | null; name: string }) {
  if (image) {
    return (
      <Image
        resizeMode="contain"
        source={{ uri: image }}
        style={styles.picture}
      />
    );
  }

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.square}
    >
      <Text style={styles.letter}>{(name.trim()[0] ?? "T").toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  picture: { width: SIZE, height: SIZE },
  square: {
    width: SIZE,
    height: SIZE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ink,
  },
  letter: { fontSize: 22, fontWeight: "700", color: colors.white },
});
