import { router } from "expo-router";
import { Animated, ScrollView, StyleSheet, View } from "react-native";

import { BundleCard } from "../../components/bundle/BundleCard";
import { FloatingActions } from "../../components/CartButton";
import { CategoryTile } from "../../components/CategoryTile";
import { Features } from "../../components/Features";
import { Heading } from "../../components/Heading";
import { Hero, HERO_TOP } from "../../components/Hero";
import { ProductCard } from "../../components/product/ProductCard";
import { FailedView, LoadingView, StateView } from "../../components/StateView";
import { dealProducts, newArrivals } from "../../lib/shelves";
import { t } from "../../lib/strings";
import { colors, GUTTER } from "../../lib/theme";
import { useCatalogue } from "../../lib/useCatalogue";
import { useParallax } from "../../lib/useParallax";

/** A card in a sideways band: a little over two show, so the band reads as one to swipe. */
const CARD = 168;
const BUNDLE = 300;

/**
 * Home, as the website's: the hero, the categories, the deals (bundles first, then what a rule
 * is on), the new arrivals and the four promises. A band with nothing to show is left out - a
 * "Deals" heading over nothing is a promise broken on the first screen.
 */
export default function HomeScreen() {
  const { status, catalogue, retry } = useCatalogue();
  const { scrollY, onScroll } = useParallax();

  if (status === "loading") return <LoadingView />;
  if (status === "failed") return <FailedView onRetry={retry} />;

  const deals = dealProducts(catalogue);
  const arrivals = newArrivals(catalogue);

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        scrollEventThrottle={16}
        onScroll={onScroll}
        showsVerticalScrollIndicator={false}
        style={styles.screen}
      >
        {/* Above the hero, off the screen: a pull past the top (a phone's bounce) shows more of the
          hero's own top colour, never the page's white behind it. */}
        <View pointerEvents="none" style={styles.overscroll} />
        <Hero image={catalogue.images.hero} scrollY={scrollY} />
        {/* Opaque: it slides up over the hero's phone. */}
        <View style={styles.page}>
          {catalogue.categories.length > 0 ? (
            <View style={styles.section}>
              <Heading title={t("categories.label")} />
              <ScrollView
                horizontal
                contentContainerStyle={styles.band}
                showsHorizontalScrollIndicator={false}
              >
                {catalogue.categories.map((category) => (
                  <CategoryTile
                    key={category.id}
                    category={category}
                    onPress={() => router.push(`/category/${category.id}`)}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {catalogue.combos.length > 0 || deals.length > 0 ? (
            <View style={styles.section}>
              <Heading text={t("deals.text")} title={t("deals.title")} />
              <ScrollView
                horizontal
                contentContainerStyle={styles.band}
                showsHorizontalScrollIndicator={false}
              >
                {catalogue.combos.map((combo) => (
                  <BundleCard key={combo.id} combo={combo} width={BUNDLE} />
                ))}
                {deals.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    width={CARD}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {arrivals.length === 0 ? (
            <StateView
              message={t("home.emptyMessage")}
              title={t("home.emptyTitle")}
            />
          ) : (
            <View style={styles.section}>
              <Heading
                action={t("arrivals.viewAll")}
                title={t("arrivals.title")}
                onAction={() => router.navigate("/shop")}
              />
              <ScrollView
                horizontal
                contentContainerStyle={styles.band}
                showsHorizontalScrollIndicator={false}
              >
                {arrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    width={CARD}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Features />
          </View>
        </View>
      </Animated.ScrollView>
      {/* The language and the bag, fixed over the screen as it scrolls. */}
      <FloatingActions alwaysLanguage />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.page },
  scroll: { paddingBottom: 36 },
  overscroll: {
    position: "absolute",
    top: -1200,
    left: 0,
    right: 0,
    height: 1200,
    backgroundColor: HERO_TOP,
  },
  page: { backgroundColor: colors.page },
  section: { marginTop: 32 },
  band: { paddingHorizontal: GUTTER, gap: 12, alignItems: "stretch" },
});
