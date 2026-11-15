import { router, type Href } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { t } from "../lib/strings";
import { GUTTER } from "../lib/theme";

import { BackChevron, HeaderButton } from "./HeaderButton";

/**
 * Back where the shopper came from - or to `fallback`, for a screen opened straight from a link
 * or with nothing behind it. This one is for the left of a screen's header.
 */
export function BackButton({ fallback = "/" }: { fallback?: Href }) {
  return (
    <HeaderButton label={t("common.back")} onPress={() => goBack(fallback)}>
      <BackChevron />
    </HeaderButton>
  );
}

/**
 * The same, for a screen with no header: fixed at the screen's top corner, over the scrolling
 * content (drawn outside the scroll view), readable over any photo or text.
 */
export function FloatingBackButton({ fallback = "/" }: { fallback?: Href }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.corner, { top: insets.top + 10 }]}>
      <HeaderButton
        floating
        label={t("common.back")}
        onPress={() => goBack(fallback)}
      >
        <BackChevron />
      </HeaderButton>
    </View>
  );
}

function goBack(fallback: Href): void {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

const styles = StyleSheet.create({
  corner: { position: "absolute", left: GUTTER, zIndex: 10 },
});
