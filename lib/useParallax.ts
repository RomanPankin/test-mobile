import { useMemo, useRef } from "react";
import { Animated, Platform } from "react-native";

type Value = InstanceType<typeof Animated.Value>;

/** How far down the screen has scrolled, for a picture at its top to move by. */
export function useParallax() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: Platform.OS !== "web",
      }),
    [scrollY],
  );

  return { scrollY, onScroll };
}

/**
 * A picture `height` tall at the top of a scroll: it falls behind at under half the scroll's
 * pace, so the page slides over it, and grows from its top when the page is pulled down past
 * the top (a phone's bounce) rather than showing a gap.
 */
export function parallaxStyle(scrollY: Value, height: number) {
  return {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-height, 0, height],
          outputRange: [-height / 2, 0, height * 0.45],
        }),
      },
      {
        scale: scrollY.interpolate({
          inputRange: [-height, 0],
          outputRange: [2, 1],
          extrapolateRight: "clamp",
        }),
      },
    ],
  };
}

/** What sits over the picture: fades and drifts up as it scrolls away. */
export function fadeAwayStyle(scrollY: Value, height: number) {
  return {
    opacity: scrollY.interpolate({
      inputRange: [0, height * 0.55],
      outputRange: [1, 0],
      extrapolate: "clamp",
    }),
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [0, height],
          outputRange: [0, -height * 0.15],
          extrapolate: "clamp",
        }),
      },
    ],
  };
}
