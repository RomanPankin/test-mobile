import type { ReactNode } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { t } from "../lib/strings";
import { colors } from "../lib/theme";
import { useSlideIn } from "../lib/useSlideIn";

/** How much of the screen shows above a sheet, as iOS leaves it. */
const TOP_GAP = 54;

/**
 * A bottom sheet with Cancel and a title: on an iPhone the real one (`pageSheet`, which swipes
 * down by itself), elsewhere the same shape drawn here, sliding up over a dimmed screen.
 */
export function Sheet({
  title,
  visible,
  onClose,
  children,
}: {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const body = (
    <View style={styles.body}>
      <View style={styles.bar}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          style={styles.cancel}
          onPress={onClose}
        >
          <Text style={styles.cancelLabel}>{t("common.cancel")}</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={visible}
        onRequestClose={onClose}
      >
        {body}
      </Modal>
    );
  }

  return (
    <DrawnSheet visible={visible} onClose={onClose}>
      {body}
    </DrawnSheet>
  );
}

function DrawnSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const { height } = useWindowDimensions();
  const { shown, mounted } = useSlideIn(visible);
  const sheetHeight = height - TOP_GAP;
  const translateY = shown.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight, 0],
  });

  return (
    <Modal
      transparent
      animationType="none"
      visible={mounted}
      onRequestClose={onClose}
    >
      <View style={styles.drawn}>
        <Animated.View style={[styles.backdrop, { opacity: shown }]}>
          <Pressable style={styles.fill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { height: sheetHeight, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.grabber} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  drawn: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    overflow: "hidden",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: colors.page,
  },
  grabber: {
    position: "absolute",
    zIndex: 1,
    top: 5,
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(60, 60, 67, 0.3)",
  },
  body: { flex: 1, backgroundColor: colors.page },
  bar: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  title: {
    maxWidth: "56%",
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
  },
  cancel: { position: "absolute", left: 16, paddingVertical: 8 },
  cancelLabel: { fontSize: 17, color: colors.ink },
});
