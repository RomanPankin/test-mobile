import { router, useLocalSearchParams } from "expo-router";
import {
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ActionButton } from "../../components/ActionButton";
import { FloatingBackButton } from "../../components/BackButton";
import { FloatingActions } from "../../components/CartButton";
import { ProductComments } from "../../components/feedback/ProductComments";
import { RatingLine } from "../../components/feedback/RatingLine";
import { BadgeRow } from "../../components/product/BadgeRow";
import { Gallery } from "../../components/product/Gallery";
import { Overview } from "../../components/product/Overview";
import { ProductGrid } from "../../components/product/ProductGrid";
import { CollapsibleSection } from "../../components/product/CollapsibleSection";
import { ProductSection } from "../../components/product/ProductSection";
import { Promises } from "../../components/product/Promises";
import { ReviewsLink } from "../../components/product/ReviewsLink";
import { SpecSheet } from "../../components/product/SpecSheet";
import { Swatches } from "../../components/product/Swatches";
import { QuantityStepper } from "../../components/QuantityStepper";
import { SignInSheet } from "../../components/SignInSheet";
import { FailedView, LoadingView, StateView } from "../../components/StateView";
import { productBadges } from "../../lib/badges";
import { addLine } from "../../lib/cartStore";
import { productById } from "../../lib/catalogue";
import {
  firstColour,
  isSoldOut,
  PLAIN_VARIANT,
  productColours,
  photosInColour,
} from "../../lib/colours";
import { discounted } from "../../lib/deals";
import { messageOf } from "../../lib/errors";
import { money } from "../../lib/money";
import { useProductFeedback } from "../../lib/productFeedback";
import {
  brandOf,
  overviewOf,
  specGroupsOf,
  warrantyMonths,
} from "../../lib/specs";
import { t } from "../../lib/strings";
import { colors, GUTTER, heading } from "../../lib/theme";
import { useCatalogue } from "../../lib/useCatalogue";

/**
 * One product, as the website's page has it: the gallery, its maker, name and spec line, the
 * customers' votes and the way down to their reviews, the badges, the price in the colour chosen
 * (after any deal, the old one struck through), the colour swatches and the shop's promises -
 * then its long overview, its full tech specs grouped the way buyers compare them, the reviews,
 * and more from its category. The quantity and "Add to bag" stay pinned at the foot.
 */
export default function ProductScreen() {
  const { id, colour: askedColour } = useLocalSearchParams<{
    id: string;
    colour?: string;
  }>();
  const { status, catalogue, retry } = useCatalogue();
  const { width, height } = useWindowDimensions();
  // As wide as the screen, never more than half its height: a tablet on its side would
  // otherwise be all photo.
  const galleryHeight = Math.min(
    Math.round(width * 0.9),
    Math.round(height / 2),
  );
  const product = catalogue ? productById(catalogue, id) : undefined;
  const colours = useMemo(
    () =>
      product && catalogue ? productColours(product, catalogue.hexOf) : [],
    [product, catalogue],
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // No tab bar under the product: its footer keeps clear of the home indicator itself.
  const insets = useSafeAreaInsets();
  // What customers say about it: the stars or likes under its name, the reviews at its foot.
  const feedback = useProductFeedback(product?.id ?? "");
  const [signingIn, setSigningIn] = useState(false);
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  // Where the reviews start in the scroll, for the link under the name to bring them up.
  const [reviewsAt, setReviewsAt] = useState(0);

  // No header on this screen, so a product that has not shown yet still needs its way back.
  if (status === "loading")
    return (
      <WithBack>
        <LoadingView />
      </WithBack>
    );
  if (status === "failed") {
    return (
      <WithBack>
        <FailedView onRetry={retry} />
      </WithBack>
    );
  }

  if (!product) {
    return (
      <WithBack>
        <StateView
          action={t("common.toShop")}
          message={t("product.notFoundMessage")}
          title={t("product.notFoundTitle")}
          onAction={() => router.replace("/shop")}
        />
      </WithBack>
    );
  }

  // The colour tapped here, else the one the card had picked, else the first on sale.
  const colour =
    colours.find((item) => item.id === (picked ?? askedColour)) ??
    firstColour(colours);
  const badges = productBadges(product, catalogue.rules);
  const saving = badges.deal?.discount;
  const unit = colour?.price ?? product.price;
  const pays = unit === undefined ? undefined : discounted(unit, saving);
  const productSoldOut = isSoldOut(product);
  const soldOut = productSoldOut || (colour ? !colour.available : false);
  const brand = brandOf(product);
  // Writing and voting need a signed-in customer, and this app signs in by email or Google: a
  // shop offering neither has its reviews and votes only read here.
  const canSignIn = Boolean(
    catalogue.site.customerSignInMethods?.email ||
      catalogue.site.customerSignInMethods?.google,
  );

  const overview = overviewOf(product);
  const specs = specGroupsOf(product, catalogue.settings);
  // More from its category - the first it is filed under - as the website's "You may also like".
  const categoryId = product.categories?.find(Boolean)?.id;
  const related = categoryId
    ? catalogue.products
        .filter(
          (each) =>
            each.id !== product.id &&
            each.categories?.some((category) => category?.id === categoryId),
        )
        .slice(0, 4)
    : [];

  const add = async () => {
    setBusy(true);
    setError(null);
    setAdded(false);

    try {
      await addLine({
        productId: product.id,
        quantity,
        variant: PLAIN_VARIANT,
        ...(colour ? { variantId: colour.id } : {}),
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
      <ScrollView
        ref={scroller}
        // The review box is at the foot: the keyboard must not cover what is being typed.
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        style={styles.scroller}
      >
        {/* The chosen colour's own photos; keyed, so a new colour starts at its first picture. */}
        <Gallery
          key={colour?.id ?? "product"}
          faded={productSoldOut}
          height={galleryHeight}
          media={photosInColour(product.media, colour)}
          width={width}
        />
        <View style={styles.body}>
          {brand ? (
            <Text style={styles.eyebrow}>{brand.toUpperCase()}</Text>
          ) : null}
          <Text style={styles.name}>{product.name}</Text>
          {product.description ? (
            <Text style={styles.spec}>{product.description}</Text>
          ) : null}
          <RatingLine
            canSignIn={canSignIn}
            state={feedback}
            onSignIn={() => setSigningIn(true)}
          />
          <View style={styles.reviewsLink}>
            <ReviewsLink
              canSignIn={canSignIn}
              state={feedback}
              onPress={() =>
                scroller.current?.scrollTo({ y: reviewsAt, animated: true })
              }
            />
          </View>
          {badges.deal || badges.mark || productSoldOut ? (
            <View style={styles.badges}>
              <BadgeRow badges={badges} soldOut={productSoldOut} />
            </View>
          ) : null}
          {pays !== undefined && unit !== undefined ? (
            <View style={styles.priceRow}>
              <Text
                style={[styles.price, pays < unit ? styles.dealPrice : null]}
              >
                {money(pays)}
              </Text>
              {pays < unit ? (
                <Text style={styles.was}>{money(unit)}</Text>
              ) : null}
            </View>
          ) : null}

          {colours.length > 0 ? (
            <View style={styles.colours}>
              <Text style={styles.label}>
                {colour
                  ? t("product.colourNamed", { name: colour.name })
                  : t("product.colour")}
              </Text>
              <Swatches
                colours={colours}
                size={26}
                value={colour?.id ?? null}
                onChange={(next) => {
                  setPicked(next);
                  setAdded(false);
                }}
              />
            </View>
          ) : null}

          {soldOut ? (
            <Text style={styles.soldOut}>{t("product.soldOutText")}</Text>
          ) : null}

          <View style={styles.promises}>
            <Promises warrantyMonths={warrantyMonths(product)} />
          </View>

          {overview.length > 0 ? (
            <ProductSection title={t("product.overview")}>
              <Overview paragraphs={overview} />
            </ProductSection>
          ) : null}
          {specs.length > 0 ? (
            <CollapsibleSection title={t("product.specs")}>
              <SpecSheet groups={specs} />
            </CollapsibleSection>
          ) : null}
        </View>
        <View
          style={styles.reviews}
          onLayout={(event) => setReviewsAt(event.nativeEvent.layout.y)}
        >
          <ProductComments
            canSignIn={canSignIn}
            productId={product.id}
            state={feedback}
            onSignIn={() => setSigningIn(true)}
          />
        </View>
        {related.length > 0 ? (
          <ProductSection inset title={t("product.related")}>
            <ProductGrid products={related} />
          </ProductSection>
        ) : null}
      </ScrollView>
      {/* Back, the language and the bag, fixed over the screen as it scrolls. */}
      <FloatingBackButton fallback="/shop" />
      <FloatingActions />

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {added ? (
          <Text style={styles.added}>
            {t("product.added", { name: product.name })}
          </Text>
        ) : null}
        <View style={styles.order}>
          <QuantityStepper value={quantity} onChange={setQuantity} />
          <ActionButton
            grow
            busy={busy}
            disabled={soldOut}
            label={
              soldOut
                ? t("product.soldOut")
                : pays !== undefined
                  ? `${t("product.addToBag")}  ${money(pays * quantity)}`
                  : t("product.addToBag")
            }
            onPress={() => void add()}
          />
        </View>
      </View>

      <SignInSheet
        visible={signingIn}
        onClose={() => setSigningIn(false)}
        onSignedIn={() => {
          setSigningIn(false);
          feedback.signedInNow();
        }}
      />
    </View>
  );
}

function WithBack({ children }: { children: ReactNode }) {
  return (
    <View style={styles.screen}>
      {children}
      <FloatingBackButton fallback="/shop" />
      <FloatingActions />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  scroller: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 24, backgroundColor: colors.page },
  body: { paddingHorizontal: GUTTER, paddingTop: 20 },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    color: colors.muted,
  },
  name: {
    ...heading,
    marginTop: 4,
    fontSize: 27,
    lineHeight: 32,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  spec: { marginTop: 4, fontSize: 14.5, color: colors.muted },
  reviewsLink: { marginTop: 10 },
  badges: { marginTop: 12 },
  priceRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  price: { ...heading, fontSize: 24, color: colors.ink },
  dealPrice: { color: colors.brand },
  was: {
    fontSize: 15,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  colours: { marginTop: 20, gap: 10 },
  label: { fontSize: 13.5, fontWeight: "500", color: colors.ink },
  soldOut: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: colors.danger,
  },
  promises: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  reviews: { paddingHorizontal: GUTTER },
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
