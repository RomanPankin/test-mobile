import type { PublicCart } from "@estoreclub/app";

import { StyleSheet, Text, View } from "react-native";

import { money } from "../lib/money";
import { t } from "../lib/strings";
import { colors, GUTTER, heading } from "../lib/theme";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/** What the bag comes to. The server's own sums: this is what it will charge. */
export function CartTotals({ cart }: { cart: PublicCart }) {
  const linesTotal = cart.items.reduce((sum, item) => sum + item.total, 0);

  return (
    <View style={styles.totals}>
      <Row label={t("cart.subtotal")} value={money(linesTotal)} />
      {cart.discount > 0 ? (
        <Row label={t("cart.discount")} value={`-${money(cart.discount)}`} />
      ) : null}
      {cart.tax > 0 && !cart.taxInclusive ? (
        <Row label={cart.taxName} value={money(cart.tax)} />
      ) : null}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t("cart.total")}</Text>
        <Text style={styles.totalValue}>{money(cart.total)}</Text>
      </View>
      {cart.tax > 0 && cart.taxInclusive ? (
        <Text style={styles.note}>
          {t("cart.taxIncluded", { name: cart.taxName, rate: cart.taxRate })}:{" "}
          {money(cart.tax)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  totals: { paddingHorizontal: GUTTER, paddingTop: 18, gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 15, color: colors.muted },
  value: { fontSize: 15, color: colors.ink },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 4,
  },
  totalLabel: { ...heading, fontSize: 20, color: colors.ink },
  totalValue: { ...heading, fontSize: 22, color: colors.ink },
  note: { fontSize: 12, color: colors.muted, textAlign: "right" },
});
