import { getCustomer, type PublicCustomerAccount } from "@estoreclub/app";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AccountPanel } from "../../components/AccountPanel";
import { InfoLinks } from "../../components/InfoLinks";
import { SignInForm } from "../../components/SignInForm";
import { FailedView, LoadingView, StateView } from "../../components/StateView";
import { canSignIn } from "../../lib/googleSignIn";
import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";
import { useCatalogue } from "../../lib/useCatalogue";

type Who =
  | { status: "checking" }
  | { status: "failed" }
  | { status: "known"; customer: PublicCustomerAccount | null };

export default function AccountScreen() {
  const shop = useCatalogue();
  const [who, setWho] = useState<Who>({ status: "checking" });

  const check = useCallback(() => {
    setWho({ status: "checking" });
    getCustomer().then(
      (customer) => setWho({ status: "known", customer }),
      () => setWho({ status: "failed" }),
    );
  }, []);

  useEffect(check, [check]);

  if (shop.status === "failed") return <FailedView onRetry={shop.retry} />;
  if (who.status === "failed") return <FailedView onRetry={check} />;
  if (shop.status === "loading" || who.status === "checking") {
    return <LoadingView />;
  }

  if (who.customer) {
    return <AccountPanel customer={who.customer} onSignedOut={check} />;
  }

  // Signed out, the help pages still stand under the form: "How much is delivery?" comes
  // before any order.
  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
    >
      {canSignIn(shop.catalogue.site) ? (
        <SignInForm onSignedIn={check} />
      ) : (
        <View style={styles.unavailable}>
          <StateView
            message={t("account.unavailableMessage")}
            title={t("account.unavailableTitle")}
          />
        </View>
      )}
      <InfoLinks />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  scroll: { paddingBottom: 32 },
  unavailable: { minHeight: 260 },
});
