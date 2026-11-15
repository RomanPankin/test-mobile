import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "../lib/strings";
import { colors } from "../lib/theme";

/**
 * Google's "G" in its four colours, drawn from views (no SVG in the app): a ring whose four
 * borders are red, yellow, green and blue, turned so each sits where Google's does, the top
 * right cut away, and the blue bar in to the middle.
 */
function GoogleMark() {
  return (
    <View style={styles.mark}>
      <View style={styles.ring} />
      <View style={styles.cut} />
      <View style={styles.bar} />
    </View>
  );
}

/** "Continue with Google": white, with Google's own G, as Google asks its button to look. */
export function GoogleButton({
  busy,
  onPress,
}: {
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      style={({ pressed }) => [
        styles.button,
        busy ? styles.busy : null,
        pressed ? styles.pressed : null,
      ]}
      onPress={onPress}
    >
      <GoogleMark />
      <Text style={styles.label}>{t("account.continueWithGoogle")}</Text>
    </Pressable>
  );
}

const MARK = 20;
const STROKE = 4;

const styles = StyleSheet.create({
  button: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  busy: { opacity: 0.6 },
  pressed: { backgroundColor: colors.tile },
  mark: { width: MARK, height: MARK },
  ring: {
    width: MARK,
    height: MARK,
    borderRadius: MARK / 2,
    borderWidth: STROKE,
    borderTopColor: "#EA4335",
    borderLeftColor: "#FBBC05",
    borderBottomColor: "#34A853",
    borderRightColor: "#4285F4",
    transform: [{ rotate: "-45deg" }],
  },
  // The G's open mouth, top right.
  cut: {
    position: "absolute",
    top: 0,
    right: 0,
    width: MARK / 2,
    height: MARK / 2 - STROKE / 2,
    backgroundColor: colors.white,
  },
  bar: {
    position: "absolute",
    top: MARK / 2 - STROKE / 2,
    left: MARK / 2,
    width: MARK / 2,
    height: STROKE,
    backgroundColor: "#4285F4",
  },
  label: { fontSize: 16, fontWeight: "600", color: colors.ink },
});
