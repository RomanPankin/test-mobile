import { useState, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, GUTTER, heading } from "../lib/theme";

const BAR = 56;

interface HeaderProps {
  options: {
    title?: string;
    headerLeft?: (props: { canGoBack: boolean }) => ReactNode;
    headerRight?: (props: { canGoBack: boolean }) => ReactNode;
  };
  back?: { title?: string };
}

/**
 * The app's header, as a navigator's `header` option: the website's white bar - the screen's
 * name centred in ink, its buttons at the sides, and a hairline under it, nothing more.
 */
export function AppHeader({ options, back }: HeaderProps) {
  const insets = useSafeAreaInsets();
  const canGoBack = Boolean(back);
  // The title is centred on the screen, kept clear of the wider of the two sides - the bag's
  // pill grows with its total, and a title under it would be read through it.
  const [sides, setSides] = useState({ left: 0, right: 0 });
  const clear = Math.max(sides.left, sides.right) + 8;

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <View
          pointerEvents="none"
          style={[styles.middle, { paddingHorizontal: GUTTER + clear }]}
        >
          <Text numberOfLines={1} style={styles.title}>
            {options.title}
          </Text>
        </View>
        <View
          style={styles.side}
          onLayout={(event) => {
            const left = event.nativeEvent.layout.width;

            setSides((was) => (was.left === left ? was : { ...was, left }));
          }}
        >
          {options.headerLeft?.({ canGoBack })}
        </View>
        <View
          style={styles.side}
          onLayout={(event) => {
            const right = event.nativeEvent.layout.width;

            setSides((was) => (was.right === right ? was : { ...was, right }));
          }}
        >
          {options.headerRight?.({ canGoBack })}
        </View>
      </View>
    </View>
  );
}

/** For `screenOptions`: the header every screen of a navigator draws. */
export function appHeader(props: HeaderProps): ReactNode {
  return <AppHeader {...props} />;
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.page,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  row: {
    height: BAR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: GUTTER,
  },
  side: { flexDirection: "row", alignItems: "center" },
  middle: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...heading, fontSize: 17, color: colors.ink },
});
