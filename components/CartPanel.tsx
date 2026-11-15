import type { PublicCart } from "@estoreclub/app";

import { router, usePathname, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  changeQuantity,
  refreshCart,
  startNewCart,
  useCart,
} from "../lib/cartStore";
import { openCheckout } from "../lib/checkout";
import { codeOf, messageOf } from "../lib/errors";
import { canSignIn } from "../lib/googleSignIn";
import { t } from "../lib/strings";
import { colors, GUTTER } from "../lib/theme";
import { useCatalogue } from "../lib/useCatalogue";

import { ActionButton } from "./ActionButton";
import { CartLine } from "./CartLine";
import { CartTotals } from "./CartTotals";
import { SignInSheet } from "./SignInSheet";
import { FailedView, LoadingView, StateView } from "./StateView";

/** What a refusal to check out asks the shopper to do about it. */
const NEEDS_SIGN_IN = new Set([
  "sign_in_required",
  "customer_sign_in_required",
  // A product sold from an age, checked against the account's birth date.
  "order_age_sign_in",
]);
const NEEDS_ACCOUNT = new Set([...NEEDS_SIGN_IN, "customer_details_required"]);

/**
 * What a line is, in words: its colour, or - on a bundle - every pick in it with its colour,
 * as the website's bag writes "Phone 16 Pro (Black Titanium)" under the bundle's name.
 */
function describe(item: PublicCart["items"][number]): string {
  if (item.combo) {
    return item.combo.picks
      .map((pick) =>
        pick.variantName ? `${pick.name} (${pick.variantName})` : pick.name,
      )
      .join(", ");
  }

  return item.variantName ?? "";
}

/**
 * The bag and the way to pay, for the Bag tab and the screen the bag icon opens. Delivery only:
 * the address is asked, and the delivery priced, on the payment page.
 */
export function CartPanel() {
  const { cart, status } = useCart();
  const pathname = usePathname();
  // As its own screen (the bag icon), no tab bar below: the footer clears the home indicator.
  const insets = useSafeAreaInsets();
  const bottom = pathname === "/basket" ? insets.bottom : 0;
  // Opened from the bag icon, the bag is a screen over the one being read: going on from it
  // closes it, so Back from where it leads returns to that screen rather than to the bag.
  const leave = (href: Href) =>
    pathname === "/basket" ? router.replace(href) : router.navigate(href);
  const shop = useCatalogue();
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAccount, setNeedsAccount] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    void refreshCart();
  }, []);

  if (shop.status === "failed") return <FailedView onRetry={shop.retry} />;
  if (status === "failed" && !cart) {
    return <FailedView onRetry={() => void refreshCart()} />;
  }
  if (shop.status === "loading" || (!cart && status !== "ready")) {
    return <LoadingView />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <StateView
        action={t("cart.browse")}
        message={t("cart.emptyMessage")}
        title={t("cart.emptyTitle")}
        onAction={() => leave("/shop")}
      />
    );
  }

  const quantity = async (cartItemId: string, value: number) => {
    setBusy(true);
    setError(null);

    try {
      await changeQuantity(cartItemId, value);
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };

  const checkout = async () => {
    setPaying(true);
    setError(null);
    setNeedsAccount(false);

    try {
      await openCheckout();
      setOpened(Platform.OS !== "web");
    } catch (failure) {
      const code = codeOf(failure);

      // Signing in is done here, over the bag, and the payment goes on once it is.
      if (NEEDS_SIGN_IN.has(code ?? "") && canSignIn(shop.catalogue.site)) {
        setSigningIn(true);

        return;
      }

      setNeedsAccount(NEEDS_ACCOUNT.has(code ?? ""));
      setError(
        code === "no_site_url" ? t("cart.noSiteUrl") : messageOf(failure),
      );
    } finally {
      setPaying(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} style={styles.lines}>
        {cart.items.map((item) => (
          <CartLine
            key={item.cartItemId}
            description={describe(item)}
            disabled={busy}
            item={item}
            onQuantity={(value) => void quantity(item.cartItemId, value)}
          />
        ))}
        <CartTotals cart={cart} />
        <Text style={styles.note}>{t("cart.deliveryNote")}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 14 + bottom }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {needsAccount ? (
          <ActionButton
            label={t("cart.signInToOrder")}
            onPress={() => {
              setNeedsAccount(false);
              setError(null);
              leave("/account");
            }}
          />
        ) : (
          <ActionButton
            busy={paying}
            disabled={busy}
            label={t("cart.checkout")}
            onPress={() => void checkout()}
          />
        )}
        {opened ? (
          <View style={styles.paid}>
            <Text style={styles.paidText}>{t("cart.paidAlready")}</Text>
            <ActionButton
              label={t("cart.startNew")}
              tone="quiet"
              onPress={() => {
                setOpened(false);
                void startNewCart();
              }}
            />
          </View>
        ) : null}
      </View>

      <SignInSheet
        visible={signingIn}
        onClose={() => setSigningIn(false)}
        onSignedIn={() => {
          setSigningIn(false);
          void checkout();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  lines: { flex: 1 },
  scroll: { paddingBottom: 20 },
  note: {
    paddingHorizontal: GUTTER,
    paddingTop: 14,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  footer: {
    gap: 10,
    paddingHorizontal: GUTTER,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.page,
  },
  error: { fontSize: 14, lineHeight: 20, color: colors.danger },
  paid: { gap: 8, alignItems: "center" },
  paidText: { fontSize: 14, color: colors.muted },
});
