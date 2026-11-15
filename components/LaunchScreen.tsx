import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

import { loadCatalogue, loadedCatalogue } from "../lib/catalogue";
import { t } from "../lib/strings";
import { colors } from "../lib/theme";

/** The launch screen's ground - the native splash's too (app.json), so the hand-over is unseen. */
export const LAUNCH_BACKGROUND = "#f4f6f8";

/** Shown at least this long: a launch screen that flashes for a frame reads as a glitch. */
const MIN_MS = 1100;
const FADE_MS = 420;

// The native splash stays until this screen is drawn over it.
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * The app's opening screen, over everything until the catalogue is read: the shop's mark growing
 * in, its name and line beneath, two soft circles of the brand's blue behind, and a slim bar
 * running along the bottom while it loads - then the whole of it fades into the first screen.
 *
 * Takes over from the native splash (a picture on one colour, all a native splash can be) on the
 * same ground, so the change is invisible. Plain `Animated`, nothing to install.
 */
export function LaunchScreen() {
  const [ready, setReady] = useState(Boolean(loadedCatalogue()));
  const [gone, setGone] = useState(false);
  const [brand, setBrand] = useState<{ name: string; logo: string | null }>(() => {
    const catalogue = loadedCatalogue();

    return {
      name: catalogue?.site.siteName ?? "",
      logo: catalogue?.images.logo ?? null,
    };
  });
  const enter = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;

  // Drawn: the native splash can go, and the mark grows in.
  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => undefined);
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1300,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ).start();
  }, [enter, progress]);

  // Ready once the catalogue is read (or fails - the screens say so themselves), and not before
  // the shortest showing.
  useEffect(() => {
    const started = Date.now();
    let live = true;

    loadCatalogue()
      .then((catalogue) => {
        if (live) setBrand({ name: catalogue.site.siteName ?? "", logo: catalogue.images.logo });
      })
      .catch(() => undefined)
      .finally(() => {
        const wait = Math.max(0, MIN_MS - (Date.now() - started));

        setTimeout(() => live && setReady(true), wait);
      });

    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    Animated.timing(fade, {
      toValue: 0,
      duration: FADE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => setGone(true));
  }, [ready, fade]);

  if (gone) return null;

  const name = brand.name || "TechStore";

  return (
    <Animated.View
      accessibilityLabel={name}
      pointerEvents={ready ? "none" : "auto"}
      style={[styles.screen, { opacity: fade }]}
    >
      {/* Two soft circles of the brand's blue, behind everything. */}
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowBottom]} />

      <Animated.View
        style={[
          styles.center,
          {
            opacity: enter,
            transform: [
              {
                scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }),
              },
              {
                translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
              },
            ],
          },
        ]}
      >
        <View style={styles.markCard}>
          {brand.logo ? (
            <Image resizeMode="contain" source={{ uri: brand.logo }} style={styles.logo} />
          ) : (
            <Text style={styles.letter}>{name.trim()[0]?.toUpperCase() ?? "T"}</Text>
          )}
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.line}>{t("hero.text")}</Text>
      </Animated.View>

      {/* A slim bar running along the bottom while the shop loads. */}
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.runner,
            {
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-64, 160],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: LAUNCH_BACKGROUND,
  },
  glow: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: colors.brand,
  },
  glowTop: { top: -220, right: -160, opacity: 0.1 },
  glowBottom: { bottom: -240, left: -180, opacity: 0.07 },
  center: { alignItems: "center", paddingHorizontal: 32 },
  markCard: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    shadowColor: "#0b1a33",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  logo: { width: 60, height: 60 },
  letter: { fontSize: 40, fontWeight: "800", color: colors.ink },
  name: {
    marginTop: 22,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8,
    color: colors.ink,
  },
  line: {
    marginTop: 8,
    maxWidth: 280,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 21,
    color: colors.muted,
  },
  track: {
    position: "absolute",
    bottom: 72,
    width: 96,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "rgba(17,18,22,0.08)",
  },
  runner: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.brand,
  },
});
