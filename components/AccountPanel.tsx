import {
  getCustomerOrders,
  signOut,
  type PublicCustomerAccount,
  type PublicCustomerOrder,
} from "@estoreclub/app";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { illustrations } from "../lib/illustrations";
import { t } from "../lib/strings";
import { colors, GUTTER, heading } from "../lib/theme";
import { useCatalogue } from "../lib/useCatalogue";

import { AddressesSection } from "./account/AddressesSection";
import { CardsSection } from "./account/CardsSection";
import { ActionButton } from "./ActionButton";
import { ActionSheet } from "./ActionSheet";
import { InfoLinks } from "./InfoLinks";
import { OrderRow } from "./OrderRow";
import { FailedView, StateView } from "./StateView";

/**
 * The signed-in customer, as the website's account page: who they are, the orders on their way
 * (each opens where it has got to), the past ones, where the shop delivers to them and the cards
 * they saved - then the help pages and signing out.
 */
export function AccountPanel({
  customer,
  onSignedOut,
}: {
  customer: PublicCustomerAccount;
  onSignedOut: () => void;
}) {
  const [orders, setOrders] = useState<PublicCustomerOrder[] | null>(null);
  const [failed, setFailed] = useState(false);
  // Signing out asks first: the bag's sign-in and saved details go with it.
  const [confirming, setConfirming] = useState(false);
  // The shop's own picture for no orders, once the catalogue is read; the built-in one till then.
  const { catalogue } = useCatalogue();

  const load = useCallback(() => {
    setFailed(false);
    setOrders(null);
    getCustomerOrders({ limit: 20 }).then(
      (page) => setOrders(page.data),
      () => setFailed(true),
    );
  }, []);

  useEffect(load, [load]);

  const active = orders?.filter((order) => order.status === "open") ?? [];
  const past = orders?.filter((order) => order.status !== "open") ?? [];

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {customer.name
            ? t("account.greeting", { name: customer.name })
            : t("account.greetingAnonymous")}
        </Text>
        <Text style={styles.email}>{customer.email}</Text>
      </View>

      {failed ? <FailedView onRetry={load} /> : null}
      {!failed && !orders ? (
        <ActivityIndicator color={colors.ink} style={styles.loading} />
      ) : null}
      {orders?.length === 0 ? (
        <StateView
          illustration={catalogue?.images.noOrders ?? illustrations.noOrders}
          message={t("account.noOrdersMessage")}
          title={t("account.noOrdersTitle")}
        />
      ) : null}
      {active.length > 0 ? (
        <>
          <Text style={styles.section}>{t("account.activeOrders")}</Text>
          {active.map((order) => (
            <OrderRow key={order.orderId} order={order} />
          ))}
        </>
      ) : null}
      {past.length > 0 ? (
        <>
          <Text style={styles.section}>{t("account.pastOrders")}</Text>
          {past.map((order) => (
            <OrderRow key={order.orderId} order={order} />
          ))}
        </>
      ) : null}

      <AddressesSection />
      <CardsSection />
      <InfoLinks />

      <View style={styles.footer}>
        <ActionButton
          label={t("account.signOut")}
          tone="quiet"
          onPress={() => setConfirming(true)}
        />
      </View>

      <ActionSheet
        cancelLabel={t("common.cancel")}
        options={[
          { key: "out", label: t("account.signOut"), destructive: true },
        ]}
        title={t("account.signOutConfirm", { email: customer.email })}
        visible={confirming}
        onClose={() => setConfirming(false)}
        onPick={() => void signOut().finally(onSignedOut)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  scroll: { paddingBottom: 32 },
  header: { padding: GUTTER },
  greeting: {
    ...heading,
    fontSize: 28,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  email: { marginTop: 4, fontSize: 14, color: colors.muted },
  section: {
    ...heading,
    paddingHorizontal: GUTTER,
    paddingTop: 16,
    paddingBottom: 4,
    fontSize: 19,
    color: colors.ink,
  },
  loading: { marginTop: 32 },
  footer: { padding: GUTTER, marginTop: 20 },
});
