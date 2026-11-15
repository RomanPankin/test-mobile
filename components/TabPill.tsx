import { useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";

import { colors } from "../lib/theme";

const WIDTH = 56;
const HEIGHT = 30;
/** The tab's own padding (5), then the icon's 28-high box, which the pill overhangs by 1. */
const TOP = 4;

/**
 * The soft blue pill behind the selected tab, sliding from tab to tab: the bar's background, so
 * the tabs draw over it. Every tab is an equal share of the bar. `tabs` are the routes shown,
 * in order; over a tab (a product, the bag) it stays on the tab the shopper came from.
 */
export function TabPill({ tabs }: { tabs: string[] }) {
  const segments = useSegments() as string[];
  const [barWidth, setBarWidth] = useState(0);
  const [tab, setTab] = useState("index");
  const x = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);
  const route = segments[0] === "(tabs)" ? (segments[1] ?? "index") : null;
  const index = tabs.indexOf(tab);
  const count = tabs.length;

  useEffect(() => {
    if (route) setTab(route);
  }, [route]);

  useEffect(() => {
    if (!barWidth || index < 0) return;

    const target = (barWidth / count) * (index + 0.5) - WIDTH / 2;

    // Where it starts is no move: it is simply there as the app opens.
    if (!placed.current) {
      placed.current = true;
      x.setValue(target);

      return;
    }

    Animated.spring(x, {
      toValue: target,
      tension: 120,
      friction: 12,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [barWidth, count, index, x]);

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
    >
      {barWidth > 0 && index >= 0 ? (
        <Animated.View
          style={[styles.pill, { transform: [{ translateX: x }] }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    top: TOP,
    left: 0,
    width: WIDTH,
    height: HEIGHT,
    borderRadius: HEIGHT / 2,
    backgroundColor: colors.brandTint,
  },
});
