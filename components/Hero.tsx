import { router } from "expo-router";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { t } from "../lib/strings";
import { colors, GUTTER, heading } from "../lib/theme";
import { fadeAwayStyle, parallaxStyle } from "../lib/useParallax";

import { ActionButton } from "./ActionButton";

/** The phones' picture: nearly as wide as the screen, never taller than this. */
const MAX_IMAGE = 440;

/** The hero's share of the screen's height, at most - on every phone. */
const MAX_SHARE = 0.5;

/**
 * The band: a cool light grey deepening toward the foot, as the website's hero - and a pool of
 * light behind the phones, so they look lit rather than pasted on. CSS gradients, drawn by React
 * Native itself (`backgroundImage`) - no package.
 */
const BAND_GRADIENT =
  "radial-gradient(circle at 50% 70%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 52%), linear-gradient(180deg, #f2f5f9 0%, #e4e9f0 52%, #cfd7e3 100%)";

/** The gradient's top colour - and what a pull past the top reveals above the band. */
export const HERO_TOP = "#f2f5f9";

/** The soft shadow the phones stand on. */
const GROUND_GRADIENT =
  "radial-gradient(ellipse at 50% 50%, rgba(24, 34, 52, 0.28) 0%, rgba(24, 34, 52, 0) 70%)";

/**
 * The home screen's opening, as the website's: a band half the screen's height at most, in a cool
 * grey gradient, the two-line headline, the line under it and two pills - and the phones large at
 * the foot, in a pool of light and standing on a soft shadow. On scroll the phones fall behind
 * (`parallaxStyle`) and the words drift up and away.
 */
export function Hero({
  image,
  scrollY,
}: {
  image: string;
  scrollY: InstanceType<typeof Animated.Value>;
}) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  // Half the screen at most, on every phone: the words at the top, the phones filling what is
  // left of it (`picture`), so the shop's shelves start on the first screen.
  const heroHeight = Math.round(height * MAX_SHARE);
  const imageHeight = Math.min(MAX_IMAGE, Math.round(width * 1.02));

  return (
    <View
      style={[styles.hero, { height: heroHeight, paddingTop: insets.top + 56 }]}
    >
      {/* Above the phone (`zIndex`): when a pull grows the picture, it never covers the words. */}
      <Animated.View style={[styles.words, fadeAwayStyle(scrollY, 420)]}>
        <Text style={styles.title}>
          {t("hero.title1")}
          {"\n"}
          {t("hero.title2")}
        </Text>
        <Text style={styles.text}>{t("hero.text")}</Text>
        <View style={styles.actions}>
          <ActionButton
            label={t("hero.buy")}
            onPress={() => router.navigate("/shop")}
          />
          <ActionButton
            label={t("hero.learn")}
            tone="outline"
            onPress={() => router.navigate("/about")}
          />
        </View>
      </Animated.View>
      <Animated.View
        style={[styles.picture, parallaxStyle(scrollY, imageHeight * 2)]}
      >
        <View style={[styles.ground, { width: (width - GUTTER) * 0.6 }]} />
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={t("hero.imageAlt")}
          resizeMode="contain"
          source={{ uri: image }}
          style={[
            styles.image,
            { width: width - GUTTER, maxHeight: imageHeight },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: "hidden",
    paddingHorizontal: GUTTER,
    backgroundColor: colors.band,
    backgroundImage: BAND_GRADIENT,
  },
  title: {
    ...heading,
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: -1.5,
    color: colors.ink,
  },
  text: { marginTop: 10, fontSize: 15, lineHeight: 21, color: colors.body },
  actions: { marginTop: 18, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  words: { zIndex: 1 },
  // A pull past the top grows the phone from its top edge - down, away from the words.
  // The phones at the foot of the band, filling what the words leave.
  picture: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: 0,
    marginTop: 8,
    paddingBottom: 12,
    transformOrigin: "top",
  },
  // The phones shrink to the room the band leaves them.
  image: { flex: 1 },
  ground: {
    position: "absolute",
    bottom: 6,
    height: 26,
    borderRadius: 999,
    backgroundImage: GROUND_GRADIENT,
  },
});
