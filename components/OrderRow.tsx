import type { PublicCustomerOrder } from "@estoreclub/app";

import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { dateInWords } from "../lib/calendarNames";
import { useLanguage } from "../lib/language";
import { fromMinorUnits, money } from "../lib/money";
import { orderStatus } from "../lib/orderStatus";
import { t } from "../lib/strings";
import { colors, GUTTER } from "../lib/theme";

const STATUS_COLOR = {
  open: colors.brand,
  completed: colors.muted,
  cancelled: colors.danger,
};

/** One order: its number, when, how much, and where it stands - tapped, where it has got to. */
export function OrderRow({ order }: { order: PublicCustomerOrder }) {
  const { current: language } = useLanguage();
  const paidAt = new Date(order.paidAt);

  return (
    <Pressable
      accessibilityRole="link"
      style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]}
      onPress={() => router.push(`/order/${order.orderId}`)}
    >
      <View style={styles.side}>
        <Text style={styles.number}>
          {t("account.order", { number: order.orderNumber })}
        </Text>
        <Text style={styles.detail}>
          {dateInWords(paidAt, language, { year: true }) ??
            paidAt.toLocaleDateString(language ?? "en", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          {" · "}
          {t("account.items", { count: order.itemCount })}
        </Text>
      </View>
      <View style={styles.end}>
        <Text style={styles.total}>
          {money(
            fromMinorUnits(order.totalCents, order.currency),
            order.currency,
          )}
        </Text>
        <Text style={[styles.status, { color: STATUS_COLOR[order.status] }]}>
          {orderStatus(order)}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: GUTTER,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  pressed: { backgroundColor: colors.tile },
  side: { flex: 1, minWidth: 0 },
  number: { fontSize: 15.5, fontWeight: "600", color: colors.ink },
  detail: { marginTop: 3, fontSize: 13, color: colors.muted },
  end: { alignItems: "flex-end" },
  total: { fontSize: 15, fontWeight: "600", color: colors.ink },
  status: { marginTop: 3, fontSize: 13, fontWeight: "600" },
  chevron: { fontSize: 22, color: colors.muted },
});
