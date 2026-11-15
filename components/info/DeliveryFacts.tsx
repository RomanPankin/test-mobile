import { StyleSheet, Text, View } from "react-native";

import { t, type TextKey } from "../../lib/strings";
import { colors } from "../../lib/theme";

const FACTS: { label: TextKey; value: TextKey }[] = [
  { label: "delivery.fact.zone", value: "delivery.zone" },
  { label: "delivery.fact.fee", value: "delivery.fee" },
  { label: "delivery.fact.free", value: "delivery.freeAbove" },
  { label: "delivery.fact.eta", value: "delivery.eta" },
];

/**
 * Delivery at a glance - where, what it costs, when it is free, how long it takes - four tiles,
 * as the website's `DeliveryFacts` opens its page. The shop's own words (`App\Texts`) where it
 * changed them: the checkout prices the real delivery from the address.
 */
export function DeliveryFacts() {
  return (
    <View style={styles.grid}>
      {FACTS.map((fact) => (
        <View key={fact.label} style={styles.tile}>
          <Text style={styles.label}>{t(fact.label)}</Text>
          <Text style={styles.value}>{t(fact.value)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    flexGrow: 1,
    flexBasis: "45%",
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.tile,
  },
  label: { fontSize: 12.5, color: colors.muted },
  value: { marginTop: 4, fontSize: 16, fontWeight: "600", color: colors.ink },
});
