import { useEffect } from "react";
import * as ReactNative from "react-native";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSlideIn } from "../lib/useSlideIn";

export interface ActionSheetOption {
  key: string;
  label: string;
  /** The one in use: ticked. */
  checked?: boolean;
  /** Undoes something - signing out: in red, as iOS marks it. */
  destructive?: boolean;
}

/**
 * The iOS bottom action sheet: on an iPhone the phone's own, elsewhere the same thing drawn here.
 * The browser's react-native has no `ActionSheetIOS`, so it is reached through the namespace.
 */
export function ActionSheet({
  title,
  message,
  options,
  cancelLabel,
  visible,
  onPick,
  onClose,
}: {
  title: string;
  /** Under the title, smaller: what picking costs - a cancellation's terms. */
  message?: string;
  options: ActionSheetOption[];
  cancelLabel: string;
  visible: boolean;
  onPick: (key: string) => void;
  onClose: () => void;
}) {
  const phone = Platform.OS === "ios" ? ReactNative.ActionSheetIOS : undefined;

  useEffect(() => {
    if (!phone || !visible) return;
    phone.showActionSheetWithOptions(
      {
        title,
        message,
        options: [
          ...options.map((option) =>
            option.checked ? `✓ ${option.label}` : option.label,
          ),
          cancelLabel,
        ],
        cancelButtonIndex: options.length,
        destructiveButtonIndex: options
          .map((option, index) => (option.destructive ? index : -1))
          .filter((index) => index >= 0),
      },
      (index) => {
        onClose();
        if (index < options.length) onPick(options[index].key);
      },
    );
    // Once per opening: the props are read as they stand when it opens.
  }, [visible]);

  if (phone) return null;

  return (
    <DrawnSheet
      cancelLabel={cancelLabel}
      message={message}
      options={options}
      title={title}
      visible={visible}
      onClose={onClose}
      onPick={onPick}
    />
  );
}

function DrawnSheet({
  title,
  message,
  options,
  cancelLabel,
  visible,
  onPick,
  onClose,
}: {
  title: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel: string;
  visible: boolean;
  onPick: (key: string) => void;
  onClose: () => void;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { shown, mounted } = useSlideIn(visible);
  const translateY = shown.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <Modal
      transparent
      animationType="none"
      visible={mounted}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: shown }]}>
          <Pressable style={styles.fill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 8, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.group}>
            <View style={styles.titleRow}>
              <Text numberOfLines={2} style={styles.title}>
                {title}
              </Text>
              {message ? <Text style={styles.message}>{message}</Text> : null}
            </View>
            {options.map((option) => (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected: Boolean(option.checked) }}
                style={({ pressed }) => [
                  styles.row,
                  styles.rule,
                  pressed ? styles.pressed : null,
                ]}
                onPress={() => {
                  onClose();
                  onPick(option.key);
                }}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    option.destructive ? styles.destructive : null,
                  ]}
                >
                  {option.label}
                </Text>
                {option.checked ? <Text style={styles.tick}>{"✓"}</Text> : null}
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.row,
              styles.cancel,
              pressed ? styles.pressed : null,
            ]}
            onPress={onClose}
          >
            <Text numberOfLines={1} style={[styles.label, styles.cancelLabel]}>
              {cancelLabel}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const BLUE = "#007AFF";
const MAX_WIDTH = 420;

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end", alignItems: "center" },
  fill: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheet: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    gap: 8,
    paddingHorizontal: 8,
  },
  group: {
    overflow: "hidden",
    borderRadius: 14,
    backgroundColor: "rgba(245, 245, 245, 0.96)",
  },
  titleRow: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  title: { fontSize: 13, fontWeight: "600", color: "#8E8E93" },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: "#8E8E93",
    textAlign: "center",
  },
  row: {
    minHeight: 57,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 44,
  },
  rule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(60, 60, 67, 0.29)",
  },
  pressed: { backgroundColor: "#D1D1D6" },
  label: { fontSize: 20, color: BLUE },
  destructive: { color: "#FF3B30" },
  tick: {
    position: "absolute",
    right: 18,
    fontSize: 18,
    fontWeight: "600",
    color: BLUE,
  },
  cancel: { borderRadius: 14, backgroundColor: "#FFFFFF" },
  cancelLabel: { fontWeight: "600" },
});
