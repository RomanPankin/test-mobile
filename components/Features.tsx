import { StyleSheet, Text, View } from "react-native";

import { t, type TextKey } from "../lib/strings";
import { colors, GUTTER } from "../lib/theme";

const FEATURES: { title: TextKey; text: TextKey }[] = [
  { title: "feature.1.title", text: "feature.1.text" },
  { title: "feature.2.title", text: "feature.2.text" },
  { title: "feature.3.title", text: "feature.3.text" },
  { title: "feature.4.title", text: "feature.4.text" },
];

/**
 * The four promises the website lists under its new arrivals - free delivery, the two-year
 * warranty, trade-in, secure payment - two to a row, each behind a small blue tick.
 */
export function Features() {
  return (
    <View style={styles.grid}>
      {FEATURES.map((feature) => (
        <View key={feature.title} style={styles.item}>
          <View style={styles.tick}>
            <View style={styles.check} />
          </View>
          <Text style={styles.title}>{t(feature.title)}</Text>
          <Text style={styles.text}>{t(feature.text)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 20,
    paddingHorizontal: GUTTER,
  },
  item: { width: "50%", paddingRight: 12 },
  tick: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandTint,
  },
  check: {
    width: 11,
    height: 6,
    marginTop: -2,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.brand,
    transform: [{ rotate: "-45deg" }],
  },
  title: { marginTop: 10, fontSize: 14, fontWeight: "600", color: colors.ink },
  text: { marginTop: 3, fontSize: 12.5, lineHeight: 17, color: colors.muted },
});
