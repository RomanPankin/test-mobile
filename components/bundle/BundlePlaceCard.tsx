import type { PublicProduct } from "@estoreclub/app";
import type { BundleChoice, BundlePlace, ComboSlot } from "../../lib/bundles";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { choose, openColours, optionAvailable } from "../../lib/bundles";
import { addedPrice } from "../../lib/money";
import { photoUrl } from "../../lib/photo";
import { t } from "../../lib/strings";
import { colors, heading } from "../../lib/theme";
import { Photo } from "../Photo";
import { Swatches } from "../product/Swatches";

const THUMB = 52;

/**
 * One place in a bundle - "Your phone" - and what may fill it: each option a row with its
 * photo, the chosen one outlined, and under it the colours to choose between where the option
 * leaves the colour open. An option nothing on sale can fill is shown greyed, not hidden.
 */
export function BundlePlaceCard({
  place,
  slot,
  choice,
  products,
  hexOf,
  onChoose,
}: {
  place: BundlePlace;
  slot: ComboSlot;
  choice: BundleChoice | undefined;
  products: ReadonlyMap<string, PublicProduct>;
  hexOf: ReadonlyMap<string, string>;
  onChoose: (choice: BundleChoice) => void;
}) {
  const chosenProduct = choice
    ? products.get(choice.option.productId)
    : undefined;
  const colours = choice
    ? openColours(choice.option, chosenProduct, hexOf)
    : [];
  const single = slot.options.length === 1;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{place.name}</Text>
      <View style={styles.options}>
        {slot.options.map((option) => {
          const product = products.get(option.productId);
          const available = optionAvailable(option, product, hexOf);
          const selected =
            choice?.option.productId === option.productId &&
            choice?.option.variantId === option.variantId;
          const surcharge = addedPrice(option.surcharge);

          return (
            <Pressable
              key={`${option.productId}:${option.variantId ?? ""}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected, disabled: !available }}
              disabled={!available || single}
              style={[
                styles.option,
                selected ? styles.selected : null,
                available ? null : styles.off,
              ]}
              onPress={() => onChoose(choose(option, product, hexOf))}
            >
              <Photo
                contain
                height={THUMB}
                uri={photoUrl(product?.media, THUMB)}
                width={THUMB}
              />
              <View style={styles.words}>
                <Text numberOfLines={2} style={styles.optionName}>
                  {option.variantName
                    ? `${option.name} (${option.variantName})`
                    : option.name}
                </Text>
                {available ? (
                  surcharge ? (
                    <Text style={styles.surcharge}>{surcharge}</Text>
                  ) : null
                ) : (
                  <Text style={styles.soldOut}>{t("product.soldOut")}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
      {choice && colours.length > 0 ? (
        <View style={styles.colours}>
          <Text style={styles.label}>
            {t("product.colourNamed", {
              name:
                colours.find((item) => item.id === choice.colourId)?.name ?? "",
            })}
          </Text>
          <Swatches
            colours={colours}
            size={22}
            value={choice.colourId ?? null}
            onChange={(colourId) => onChoose({ ...choice, colourId })}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 18, gap: 12 },
  name: { ...heading, fontSize: 17, color: colors.ink },
  options: { gap: 8 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
    backgroundColor: colors.tile,
  },
  selected: { borderColor: colors.ink, backgroundColor: colors.page },
  off: { opacity: 0.5 },
  words: { flex: 1 },
  optionName: { fontSize: 14, fontWeight: "500", color: colors.ink },
  surcharge: { marginTop: 2, fontSize: 12.5, color: colors.muted },
  soldOut: { marginTop: 2, fontSize: 12.5, color: colors.danger },
  colours: { gap: 10 },
  label: { fontSize: 13, color: colors.body },
});
