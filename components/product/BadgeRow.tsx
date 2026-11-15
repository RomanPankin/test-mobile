import type { ProductBadges } from "../../lib/badges";

import { StyleSheet, View } from "react-native";

import { dealLabel, markLabel } from "../../lib/badgeWords";
import { t } from "../../lib/strings";

import { BadgePill } from "./BadgePill";

/**
 * A product's badges in a row: its deal first, then the shop's word for it, then "Sold out".
 * Nothing at all for a product with none.
 */
export function BadgeRow({
  badges,
  soldOut = false,
}: {
  badges: ProductBadges;
  soldOut?: boolean;
}) {
  const { deal, mark } = badges;

  if (!deal && !mark && !soldOut) return null;

  return (
    <View style={styles.row}>
      {deal ? (
        <BadgePill
          accessibilityLabel={deal.name}
          label={dealLabel(deal)}
          tone="deal"
        />
      ) : null}
      {mark ? <BadgePill label={markLabel(mark)} tone="mark" /> : null}
      {soldOut ? (
        <BadgePill label={t("product.soldOut")} tone="soldOut" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
});
