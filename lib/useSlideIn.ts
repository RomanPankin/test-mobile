import { useEffect, useRef, useState } from "react";
import { Animated, Platform } from "react-native";

const DURATION = 280;

/** A panel's way in and out: `shown` runs 0 to 1, and `mounted` lasts while it slides away. */
export function useSlideIn(visible: boolean) {
  const shown = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) setMounted(true);
    Animated.timing(shown, {
      toValue: visible ? 1 : 0,
      duration: DURATION,
      useNativeDriver: Platform.OS !== "web",
    }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [visible, shown]);

  return { shown, mounted };
}
