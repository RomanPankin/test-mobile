import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
} from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  "aria-selected"?: boolean;
  /** The tab bar's own button reads these; a plain `Pressable` has no use for them. */
  href?: string;
  hoverEffect?: unknown;
  pressOpacity?: number;
};

/**
 * A tab in the bottom bar, springing up as it is selected. Done on the button because it alone
 * knows: the bar draws every icon twice, one always `focused` and one never, and crossfades them.
 */
export function TabButton({
  href: _href,
  hoverEffect: _hoverEffect,
  pressOpacity: _pressOpacity,
  style,
  ...props
}: Props) {
  const selected = props["aria-selected"] ?? false;
  const scale = useRef(new Animated.Value(1)).current;
  const wasSelected = useRef(selected);

  useEffect(() => {
    if (selected && !wasSelected.current) {
      scale.setValue(0.82);
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 160,
        useNativeDriver: Platform.OS !== "web",
      }).start();
    }
    wasSelected.current = selected;
  }, [selected, scale]);

  return (
    <AnimatedPressable
      {...props}
      style={[style as object, { transform: [{ scale }] }]}
    />
  );
}
