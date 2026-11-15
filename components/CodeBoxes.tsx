import { useRef, type ComponentRef } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../lib/theme";

const LENGTH = 6;

/**
 * The emailed code as six boxes, one digit in each and the next one to fill lit in blue. One
 * field underneath takes the typing (and a pasted code, and the phone's one-time-code fill);
 * the boxes only draw it.
 */
export function CodeBoxes({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  /** With the whole code: state set by `onChange` is not read back yet. */
  onComplete: (code: string) => void;
}) {
  const field = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <Pressable style={styles.row} onPress={() => field.current?.focus()}>
      {Array.from({ length: LENGTH }, (_, index) => {
        const digit = value[index] ?? "";
        const next = index === Math.min(value.length, LENGTH - 1);

        return (
          <View
            key={index}
            style={[
              styles.box,
              digit ? styles.filled : null,
              next ? styles.next : null,
            ]}
          >
            <Text style={styles.digit}>{digit}</Text>
          </View>
        );
      })}
      <TextInput
        ref={field}
        autoFocus
        autoComplete="one-time-code"
        keyboardType="number-pad"
        maxLength={LENGTH}
        style={styles.field}
        textContentType="oneTimeCode"
        value={value}
        onChangeText={(typed) => {
          const digits = typed.replace(/\D/g, "").slice(0, LENGTH);

          onChange(digits);
          if (digits.length === LENGTH) onComplete(digits);
        }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Six equal boxes side by side, a small even gap between - not spread to the edges.
  row: { flexDirection: "row", gap: 8 },
  box: {
    flex: 1,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  filled: { borderColor: colors.ink },
  next: { borderWidth: 2, borderColor: colors.brand },
  digit: { fontSize: 24, fontWeight: "600", color: colors.ink },
  // Over the boxes, invisible: it is what the keyboard types into.
  field: { ...StyleSheet.absoluteFill, opacity: 0, color: "transparent" },
});
