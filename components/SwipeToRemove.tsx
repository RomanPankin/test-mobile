import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { t } from "../lib/strings";
import { colors } from "../lib/theme";

/** How wide the red button stands when the row is left open. */
const BUTTON = 92;
const DURATION = 200;

/**
 * A row that swipes left to remove, as iOS lists do: a short swipe leaves it open on a red
 * Remove button, a long one (past half the row) removes it at once; anything less springs back.
 * A drag that is mostly up or down is the list's scroll, not this.
 */
export function SwipeToRemove({
  disabled,
  onRemove,
  children,
}: {
  disabled: boolean;
  onRemove: () => void;
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const offset = useRef(new Animated.Value(0)).current;
  // Where the row rests: 0 closed, -BUTTON open.
  const rest = useRef(0);
  const [open, setOpen] = useState(false);
  const native = Platform.OS !== "web";

  const settle = (to: number, then?: () => void) => {
    rest.current = to;
    setOpen(to !== 0);
    Animated.timing(offset, {
      toValue: to,
      duration: DURATION,
      useNativeDriver: native,
    }).start(then);
  };

  const remove = () => settle(-width, onRemove);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx, dy }) =>
          !disabled && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, { dx }) =>
          offset.setValue(Math.min(0, rest.current + dx)),
        onPanResponderRelease: (_, { dx, vx }) => {
          const at = rest.current + dx;

          if (at < -width / 2) remove();
          else if (at < -BUTTON / 2 || vx < -0.5) settle(-BUTTON);
          else settle(0);
        },
        onPanResponderTerminate: () => settle(rest.current),
      }),
    [disabled, width],
  );

  return (
    <View style={styles.row}>
      <View style={styles.behind}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          style={[styles.button, { width: BUTTON }]}
          onPress={remove}
        >
          <Text style={styles.label}>{t("cart.remove")}</Text>
        </Pressable>
      </View>
      <Animated.View
        {...responder.panHandlers}
        style={[styles.front, { transform: [{ translateX: offset }] }]}
      >
        {children}
        {/* Left open, a tap on the row closes it rather than reaching what is under the tap. */}
        {open ? (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => settle(0)}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { overflow: "hidden" },
  behind: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: colors.brand,
  },
  button: { alignItems: "center", justifyContent: "center" },
  label: { fontSize: 15, fontWeight: "600", color: colors.white },
  front: { backgroundColor: colors.page },
});
