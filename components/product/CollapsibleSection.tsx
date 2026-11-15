import type { ReactNode } from "react";

import { useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, heading } from "../../lib/theme";

/** How long the section takes to open or close. */
const DURATION = 260;

/**
 * A product section that folds - "Tech specs", long enough to bury what follows it. Under the
 * same rule and heading as `ProductSection`, the heading a button with a chevron that turns; the
 * content slides open and shut, its height and fade animated.
 *
 * The content is measured where it lies at its full height (absolutely placed inside a clipping
 * box), and the box's height runs from 0 to that - so it opens to exactly its size, on a phone and
 * on the web alike, with no animation package.
 */
export function CollapsibleSection({
  title,
  initiallyOpen = false,
  children,
}: {
  title: string;
  initiallyOpen?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setOpen] = useState(initiallyOpen);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useRef(new Animated.Value(initiallyOpen ? 1 : 0)).current;

  const toggle = () => {
    const next = !isOpen;

    setOpen(next);
    Animated.timing(progress, {
      toValue: next ? 1 : 0,
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        hitSlop={8}
        style={({ pressed }) => [
          styles.header,
          pressed ? styles.pressed : null,
        ]}
        onPress={toggle}
      >
        <Text style={styles.title}>{title}</Text>
        <Animated.View
          style={[
            styles.chevron,
            {
              transform: [
                {
                  rotate: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["45deg", "225deg"],
                  }),
                },
              ],
            },
          ]}
        />
      </Pressable>
      <Animated.View
        style={[
          styles.clip,
          {
            height: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, contentHeight],
            }),
            opacity: progress,
          },
        ]}
      >
        <View
          style={styles.content}
          onLayout={(event) =>
            setContentHeight(event.nativeEvent.layout.height)
          }
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 28,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pressed: { opacity: 0.6 },
  title: { ...heading, fontSize: 22, color: colors.ink },
  // A chevron drawn from two borders of a square, turned: down when shut, up when open.
  chevron: {
    width: 10,
    height: 10,
    marginRight: 4,
    marginTop: -4,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.ink,
  },
  clip: { overflow: "hidden" },
  // At its full height whatever the box's, so it can be measured shut.
  content: { position: "absolute", top: 0, left: 0, right: 0, paddingTop: 16 },
});
