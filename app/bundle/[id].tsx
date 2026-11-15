import type { BundleChoice } from "../../lib/bundles";

import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionButton } from "../../components/ActionButton";
import { BundleDetails } from "../../components/bundle/BundleDetails";
import { BundlePhotos } from "../../components/bundle/BundlePhotos";
import { BundlePlaceCard } from "../../components/bundle/BundlePlaceCard";
import { BadgePill } from "../../components/product/BadgePill";
import { ProductSection } from "../../components/product/ProductSection";
import { QuantityStepper } from "../../components/QuantityStepper";
import { FailedView, LoadingView, StateView } from "../../components/StateView";
import {
  apartPrice,
  bundleItems,
  bundlePrice,
  bundleReady,
  firstChoices,
  placesOf,
  productsById,
  variantOf,
} from "../../lib/bundles";
import { addLine } from "../../lib/cartStore";
import { PLAIN_VARIANT } from "../../lib/colours";
import { messageOf } from "../../lib/errors";
import { money } from "../../lib/money";
import { t } from "../../lib/strings";
import { colors, GUTTER, heading } from "../../lib/theme";
import { useCatalogue } from "../../lib/useCatalogue";

/**
 * A bundle, as the website's page has it: the set as a picture, its name and line, the price it
 * starts from beside what the same things cost apart, then each place with its options and their
 * colours, and "Add bundle to bag" - which goes in as ONE line, priced by the server as the
 * combo. Each pick carries its colour as its `variantId`: a product with colours is refused
 * without one. Under it, every product the bundle fills, described - the one picked where a
 * place offers a choice: its photos, overview and main specs, each leading to its own screen.
 */
export default function BundleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { status, catalogue, retry } = useCatalogue();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const inner = width - GUTTER * 2;
  const combo = catalogue?.combos.find((item) => item.id === id);
  const products = useMemo(
    () => productsById(catalogue?.products ?? []),
    [catalogue],
  );
  const hexOf = catalogue?.hexOf ?? new Map<string, string>();
  const [choices, setChoices] = useState<Record<string, BundleChoice>>({});
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Every place starts on its first option on sale, in its first colour on sale.
  useEffect(() => {
    if (combo && catalogue)
      setChoices(firstChoices(combo, products, catalogue.hexOf));
  }, [combo, catalogue, products]);

  if (status === "loading") return <LoadingView />;
  if (status === "failed") return <FailedView onRetry={retry} />;
  if (!combo) {
    return (
      <StateView
        action={t("common.toShop")}
        message={t("bundle.notFoundMessage")}
        title={t("bundle.notFoundTitle")}
        onAction={() => router.replace("/shop")}
      />
    );
  }

  const places = placesOf(combo);
  const ready = bundleReady(combo, choices, products, hexOf);
  const price = bundlePrice(
    combo,
    places.flatMap((place) => (choices[place.key] ? [choices[place.key]] : [])),
    products,
  );

  const apart = apartPrice(combo, products);
  const saving = apart > combo.fromPrice ? apart - combo.fromPrice : 0;
  const items = bundleItems(combo, choices, products);

  const add = async () => {
    setBusy(true);
    setError(null);
    setAdded(false);

    try {
      await addLine({
        comboId: combo.id,
        quantity,
        picks: places.map((place) => {
          const choice = choices[place.key];
          const variantId = variantOf(choice);

          return {
            slotId: place.slotId,
            productId: choice.option.productId,
            variant: PLAIN_VARIANT,
            ...(variantId ? { variantId } : {}),
          };
        }),
      });
      setAdded(true);
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t("bundle.badge") }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <BundlePhotos combo={combo} products={products} width={inner} />
        <Text style={styles.eyebrow}>{t("bundle.badge").toUpperCase()}</Text>
        <Text style={styles.name}>{combo.name}</Text>
        {combo.description ? (
          <Text style={styles.description}>{combo.description}</Text>
        ) : null}
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {t("bundle.from", { price: money(combo.fromPrice) })}
          </Text>
          {saving ? <Text style={styles.was}>{money(apart)}</Text> : null}
          {saving ? (
            <BadgePill
              label={t("badges.save", { amount: money(saving) })}
              tone="deal"
            />
          ) : null}
        </View>
        <View style={styles.places}>
          {places.map((place, index) => {
            const slot = combo.slots.find((item) => item.id === place.slotId);

            return slot ? (
              <View key={place.key} style={index > 0 ? styles.rule : null}>
                <BundlePlaceCard
                  choice={choices[place.key]}
                  hexOf={hexOf}
                  place={place}
                  products={products}
                  slot={slot}
                  onChoose={(choice) => {
                    setAdded(false);
                    setChoices((was) => ({ ...was, [place.key]: choice }));
                  }}
                />
              </View>
            ) : null;
          })}
        </View>
        {items.length > 0 ? (
          <ProductSection title={t("bundle.inside")}>
            <BundleDetails items={items} width={inner} />
          </ProductSection>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {added ? (
          <Text style={styles.added}>
            {t("product.added", { name: combo.name })}
          </Text>
        ) : null}
        <View style={styles.order}>
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <ActionButton
            grow
            busy={busy}
            disabled={!ready}
            label={
              ready
                ? // "Add bundle to bag" and its price do not fit a phone's footer; the
                  // screen is the bundle's, so the plain "Add to bag" says it.
                  `${t("product.addToBag")}  ${money(price * quantity)}`
                : t("bundle.chooseAll")
            }
            onPress={() => void add()}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 20, paddingBottom: 24 },
  eyebrow: {
    marginTop: 20,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    color: colors.brand,
  },
  name: {
    ...heading,
    marginTop: 4,
    fontSize: 26,
    lineHeight: 31,
    color: colors.ink,
  },
  description: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: colors.body,
  },
  priceRow: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },
  price: { ...heading, fontSize: 22, color: colors.ink },
  was: {
    fontSize: 15,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  places: {
    marginTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  rule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  footer: {
    gap: 8,
    paddingHorizontal: GUTTER,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.page,
  },
  order: { flexDirection: "row", alignItems: "center", gap: 12 },
  error: { fontSize: 14, lineHeight: 20, color: colors.danger },
  added: { fontSize: 14, lineHeight: 20, color: colors.brand },
});
