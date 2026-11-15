import {
  AppApiError,
  getCustomerOrder,
  type PublicCustomerOrderDetail,
} from "@estoreclub/app";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { OrderProgress } from "../../components/order/OrderProgress";
import { FailedView, LoadingView, StateView } from "../../components/StateView";
import { dateInWords } from "../../lib/calendarNames";
import { useLanguage } from "../../lib/language";
import { fromMinorUnits, money } from "../../lib/money";
import { orderStatus } from "../../lib/orderStatus";
import { t } from "../../lib/strings";
import { colors, GUTTER, heading } from "../../lib/theme";

type Read =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "signedOut" }
  | { status: "ready"; order: PublicCustomerOrderDetail };

/**
 * Where one of the customer's orders has got to - the app's "Track order": its progress while it
 * is open, when it should be at the door, where it goes, and what is in it as charged. The
 * website tracks by the number in the confirmation email too; an app's shopper is signed in, so
 * this reads the account's own order instead.
 */
export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { current: language } = useLanguage();
  const [read, setRead] = useState<Read>({ status: "loading" });

  const load = useCallback(() => {
    setRead({ status: "loading" });
    getCustomerOrder({ orderId: id }).then(
      (order) => setRead({ status: "ready", order }),
      (error: unknown) =>
        setRead(
          error instanceof AppApiError && error.status === 401
            ? { status: "signedOut" }
            : { status: "failed" },
        ),
    );
  }, [id]);

  useEffect(load, [load]);

  if (read.status === "loading") return <LoadingView />;
  if (read.status === "failed") return <FailedView onRetry={load} />;
  if (read.status === "signedOut") {
    return (
      <StateView
        action={t("account.verify")}
        message={t("order.signInMessage")}
        title={t("order.signInTitle")}
        onAction={() => router.replace("/account")}
      />
    );
  }

  const { order } = read;
  const amount = (cents: number) =>
    money(fromMinorUnits(cents, order.currency), order.currency);
  const when = (iso: string) => {
    const date = new Date(iso);

    // Written out where the phone's engine may not know the language's names (`calendarNames`).
    return (
      dateInWords(date, language, { weekday: true, time: true }) ??
      date.toLocaleString(language ?? undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.screen}>
      <Stack.Screen
        options={{ title: t("account.order", { number: order.orderNumber }) }}
      />
      <Text style={styles.status}>{orderStatus(order)}</Text>
      {order.deliverBy && order.status === "open" ? (
        <Text style={styles.eta}>
          {t("order.deliverBy", { time: when(order.deliverBy) })}
        </Text>
      ) : null}

      {order.progress ? (
        <View style={styles.section}>
          <OrderProgress progress={order.progress} />
        </View>
      ) : null}

      {order.deliveryAddress ? (
        <View style={styles.section}>
          <Text style={styles.label}>{t("order.deliveryAddress")}</Text>
          <Text style={styles.value}>{order.deliveryAddress}</Text>
          {order.recipientName ? (
            <Text style={styles.muted}>
              {[order.recipientName, order.recipientPhone]
                .filter(Boolean)
                .join(", ")}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.label}>{t("order.items")}</Text>
        {order.lines.map((line, index) => (
          <View key={`${index}:${line.name}`} style={styles.line}>
            <View style={styles.lineWords}>
              <Text style={styles.value}>
                {line.quantity > 1
                  ? `${line.quantity} × ${line.name}`
                  : line.name}
              </Text>
              {line.variantName || line.detail ? (
                <Text style={styles.muted}>
                  {line.variantName || line.detail}
                </Text>
              ) : null}
            </View>
            <Text style={styles.value}>{amount(line.totalCents)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.row}>
          <Text style={styles.muted}>{t("cart.subtotal")}</Text>
          <Text style={styles.value}>{amount(order.subtotalCents)}</Text>
        </View>
        {order.discountCents > 0 ? (
          <View style={styles.row}>
            <Text style={styles.muted}>{t("cart.discount")}</Text>
            <Text style={styles.value}>-{amount(order.discountCents)}</Text>
          </View>
        ) : null}
        {order.taxCents > 0 && !order.taxInclusive ? (
          <View style={styles.row}>
            <Text style={styles.muted}>{order.taxName}</Text>
            <Text style={styles.value}>{amount(order.taxCents)}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.totalLabel}>{t("cart.total")}</Text>
          <Text style={styles.totalLabel}>{amount(order.totalCents)}</Text>
        </View>
        {order.refundedCents > 0 ? (
          <Text style={styles.refund}>
            {t("order.refunded", { amount: amount(order.refundedCents) })}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  scroll: { padding: GUTTER, paddingBottom: 40 },
  status: { ...heading, fontSize: 24, color: colors.ink },
  eta: { marginTop: 4, fontSize: 14.5, color: colors.brand },
  section: {
    marginTop: 22,
    paddingTop: 18,
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  label: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
  },
  value: { fontSize: 15, lineHeight: 21, color: colors.ink },
  muted: { fontSize: 13.5, lineHeight: 19, color: colors.muted },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
  },
  lineWords: { flex: 1 },
  totals: {
    marginTop: 14,
    paddingTop: 14,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { ...heading, fontSize: 18, color: colors.ink },
  refund: { fontSize: 13.5, color: colors.danger, textAlign: "right" },
});
