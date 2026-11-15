import { Tabs } from "expo-router";

import { HeaderActions } from "../../components/CartButton";
import { appHeader } from "../../components/AppHeader";
import { TabButton } from "../../components/TabButton";
import { TabPill } from "../../components/TabPill";
import {
  AccountIcon,
  CartIcon,
  HomeIcon,
  ShopIcon,
  tabIcon,
  tabLabel,
} from "../../components/TabIcon";
import { useLanguage } from "../../lib/language";
import { t, useTexts } from "../../lib/strings";
import { colors } from "../../lib/theme";

export default function TabsLayout() {
  // The tabs' labels, once the shop's default language is known - and its own words.
  useLanguage();
  useTexts();
  // The screens below that have a tab, in their order. Online only: no table, no pickup.
  const shownTabs = ["index", "shop", "cart", "account"];

  return (
    <Tabs
      // Back from a tab returns to the tab the shopper came from.
      backBehavior="history"
      screenOptions={{
        headerStyle: { backgroundColor: colors.page },
        headerTintColor: colors.ink,
        header: appHeader,
        headerShadowVisible: false,
        animation: "none",
        tabBarButton: (props) => <TabButton {...props} />,
        tabBarBackground: () => <TabPill tabs={shownTabs} />,
        // `TabPill` puts itself over the icon, which is only above the label this way.
        tabBarLabelPosition: "below-icon",
        headerRight: () => <HeaderActions />,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.line,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          headerShown: false,
          tabBarLabel: tabLabel(t("tabs.home")),
          tabBarIcon: tabIcon(HomeIcon),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: t("tabs.shop"),
          tabBarLabel: tabLabel(t("tabs.shop")),
          tabBarIcon: tabIcon(ShopIcon),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t("cart.title"),
          tabBarLabel: tabLabel(t("tabs.cart")),
          tabBarIcon: tabIcon(CartIcon),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t("tabs.account"),
          tabBarLabel: tabLabel(t("tabs.account")),
          tabBarIcon: tabIcon(AccountIcon),
        }}
      />
    </Tabs>
  );
}
