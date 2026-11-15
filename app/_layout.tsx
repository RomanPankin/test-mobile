import "../lib/setup";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { BackButton } from "../components/BackButton";
import { LaunchScreen } from "../components/LaunchScreen";
import { HeaderActions } from "../components/CartButton";
import { appHeader } from "../components/AppHeader";
import { refreshCart } from "../lib/cartStore";
import { languageReady, useLanguage } from "../lib/language";
import { t, useTexts } from "../lib/strings";
import { colors } from "../lib/theme";

export default function RootLayout() {
  // A language picked redraws every screen in it, and they read the catalogue afresh.
  const { revision } = useLanguage();
  // The headers' words, again once the shop's own arrive with the catalogue.
  useTexts();

  // Read once here: the tab bar counts the bag from any screen.
  useEffect(() => {
    void languageReady.then(refreshCart);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        key={revision}
        screenOptions={{
          headerStyle: { backgroundColor: colors.page },
          headerTintColor: colors.ink,
          header: appHeader,
          headerBackTitle: t("common.back"),
          headerShadowVisible: false,
          headerLeft: () => <BackButton />,
          headerRight: () => <HeaderActions />,
          contentStyle: { backgroundColor: colors.page },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[id]"
          // The product draws its own back button, on its gallery, so it scrolls away with it.
          options={{ headerShown: false }}
        />
        <Stack.Screen name="basket" options={{ title: t("cart.title") }} />
        <Stack.Screen
          name="bundle/[id]"
          options={{ title: t("bundle.badge") }}
        />
        <Stack.Screen name="order/[id]" options={{ title: t("order.title") }} />
        <Stack.Screen name="delivery" options={{ title: t("info.delivery") }} />
        <Stack.Screen name="faq" options={{ title: t("info.faq") }} />
        <Stack.Screen name="about" options={{ title: t("info.about") }} />
        <Stack.Screen
          name="google-sign-in"
          // Only steps aside as the Google page comes back: nothing to see, nothing to animate.
          options={{
            headerShown: false,
            animation: "none",
            presentation: "transparentModal",
          }}
        />
        <Stack.Screen
          name="paid"
          // Nothing to go back to: the order is placed. Its own buttons lead on.
          options={{ title: t("paid.title"), headerLeft: () => null }}
        />
      </Stack>
      {/* Over everything until the shop is read - then it fades into the first screen. */}
      <LaunchScreen />
    </>
  );
}
