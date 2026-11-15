import { StyleSheet, Text, View } from "react-native";

import { t, type TextKey } from "../../lib/strings";
import { colors } from "../../lib/theme";

/** The shop's promises, worded once for the home screen's `Features` and listed here too. */
const FEATURES: { title: TextKey; text: TextKey }[] = [
  { title: "feature.1.title", text: "feature.1.text" },
  { title: "feature.2.title", text: "feature.2.text" },
  { title: "feature.3.title", text: "feature.3.text" },
  { title: "feature.4.title", text: "feature.4.text" },
];

/** The promise the product's own warranty stands in for, where it states one. */
const WARRANTY_FEATURE = 1;

/**
 * What comes with it, under the price, as the website's product page lists it: the shop's four
 * promises (`feature.N`) - free delivery, the warranty, trade-in, secure payment - each its
 * title and its line, behind a blue tick. The warranty is the product's own where it has one.
 */
export function Promises({ warrantyMonths }: { warrantyMonths: number }) {
  return (
    <View style={styles.list}>
      {FEATURES.map((feature, index) => (
        <View key={feature.title} style={styles.row}>
          <View style={styles.check} />
          <Text style={styles.text}>
            <Text style={styles.title}>
              {index === WARRANTY_FEATURE && warrantyMonths > 0
                ? t("product.warranty", { count: warrantyMonths })
                : t(feature.title)}
            </Text>
            {" · "}
            {t(feature.text)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  check: {
    width: 10,
    height: 5,
    marginTop: 6,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.brand,
    transform: [{ rotate: "-45deg" }],
  },
  text: { flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.muted },
  title: { fontWeight: "500", color: colors.ink },
});
