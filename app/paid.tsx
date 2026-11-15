import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "../components/ActionButton";
import { startNewCart } from "../lib/cartStore";
import { t } from "../lib/strings";
import { colors, heading } from "../lib/theme";

/** Where the payment page hands a paying shopper back: the bag is an order now. */
export default function PaidScreen() {
  useEffect(() => {
    void startNewCart();
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{t("paid.title")}</Text>
      <Text style={styles.message}>{t("paid.message")}</Text>
      <ActionButton
        label={t("paid.orders")}
        onPress={() => router.replace("/account")}
      />
      <ActionButton
        label={t("common.toShop")}
        tone="quiet"
        onPress={() => router.replace("/shop")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 12,
    padding: 32,
    justifyContent: "center",
    backgroundColor: colors.page,
  },
  title: {
    ...heading,
    fontSize: 32,
    color: colors.ink,
    textAlign: "center",
  },
  message: {
    marginBottom: 12,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
  },
});
