import { router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "../lib/cartStore";
import { money } from "../lib/money";
import { t } from "../lib/strings";
import { colors, GUTTER } from "../lib/theme";

import { HeaderButton } from "./HeaderButton";
import { LanguageButton } from "./LanguageButton";
import { CartIcon } from "./TabIcon";

/**
 * The bag: opens it as a screen of its own, over the one being read. With something in it,
 * a black pill with the total beside the bag - and a hop each time more goes in.
 */
function CartButton({ floating }: { floating?: boolean }) {
  const pathname = usePathname();
  const { cart } = useCart();
  const count = cart?.count ?? 0;
  const hop = useHop(count);
  // Already there.
  const onCart = pathname === "/cart" || pathname === "/basket";

  return (
    <Animated.View style={{ transform: [{ scale: hop }] }}>
      <HeaderButton
        floating={floating}
        label={
          count > 0
            ? `${t("tabs.cart")} ${money(cart?.total ?? 0)}`
            : t("tabs.cart")
        }
        accent={count > 0}
        wide={count > 0}
        onPress={() => {
          if (!onCart) router.push("/basket");
        }}
      >
        <CartIcon badge={false} color={count > 0 ? colors.white : colors.ink} />
        {count > 0 ? (
          <Text numberOfLines={1} style={styles.total}>
            {money(cart?.total ?? 0)}
          </Text>
        ) : null}
      </HeaderButton>
    </Animated.View>
  );
}

/** A quick swell and settle when `count` goes up - not on the first draw, nor when it goes down. */
function useHop(count: number) {
  const scale = useRef(new Animated.Value(1)).current;
  const previous = useRef(count);

  useEffect(() => {
    const grew = count > previous.current;

    previous.current = count;
    if (!grew) return;

    const native = Platform.OS !== "web";

    Animated.timing(scale, {
      toValue: 1.22,
      duration: 140,
      useNativeDriver: native,
    }).start(() =>
      Animated.timing(scale, {
        toValue: 1,
        duration: 260,
        useNativeDriver: native,
      }).start(),
    );
  }, [count, scale]);

  return scale;
}

/** The language and the bag, for the right of a screen's header. */
export function HeaderActions() {
  const { cart } = useCart();

  return (
    <View style={styles.row}>
      {/* With something in the bag its total takes the room: the language waits. */}
      {cart?.count ? null : <LanguageButton />}
      <CartButton />
    </View>
  );
}

/**
 * The same, for a screen with no header: fixed at the screen's top corner, over the scrolling
 * content (drawn outside the scroll view), readable over any photo - the language and the bag
 * stay in reach however far the page scrolls. `alwaysLanguage`: the language stays beside a full
 * bag too - the home screen, where a shopper looks for it first.
 */
export function FloatingActions({
  alwaysLanguage,
}: {
  alwaysLanguage?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { cart } = useCart();

  return (
    <View style={[styles.row, styles.corner, { top: insets.top + 10 }]}>
      {cart?.count && !alwaysLanguage ? null : <LanguageButton floating />}
      <CartButton floating />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  corner: { position: "absolute", right: GUTTER, zIndex: 10 },
  total: { fontSize: 13, fontWeight: "700", color: colors.white },
});
