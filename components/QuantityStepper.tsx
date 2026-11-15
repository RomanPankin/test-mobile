import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "../lib/strings";
import { colors } from "../lib/theme";

/** One line's count: minus, the number, plus. */
export function QuantityStepper({
  value,
  min = 1,
  disabled,
  onChange,
}: {
  value: number;
  /** Below this the minus is greyed out. A cart line's is 0: its minus takes the line away. */
  min?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityLabel={t("quantity.decrease")}
        accessibilityRole="button"
        disabled={disabled || value <= min}
        style={styles.button}
        onPress={() => onChange(value - 1)}
      >
        <Text style={[styles.sign, value <= min ? styles.off : null]}>-</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        accessibilityLabel={t("quantity.increase")}
        accessibilityRole="button"
        disabled={disabled}
        style={styles.button}
        onPress={() => onChange(value + 1)}
      >
        <Text style={styles.sign}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  button: {
    width: 42,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sign: { fontSize: 20, color: colors.ink },
  off: { color: colors.line },
  value: {
    minWidth: 22,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: colors.ink,
  },
});
