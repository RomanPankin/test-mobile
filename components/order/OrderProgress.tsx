import type { PublicCustomerOrder } from "@estoreclub/app";

import { StyleSheet, Text, View } from "react-native";

import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";

/**
 * How far an open order has got, as the website's account draws it: "Received", then the shop's
 * own working steps, then "Delivered" - a dot and a line for each, blue up to where it is now.
 */
export function OrderProgress({
  progress,
}: {
  progress: NonNullable<PublicCustomerOrder["progress"]>;
}) {
  const steps = [t("order.received"), ...progress.steps, t("order.delivered")];
  // `current` counts the shop's steps from -1 (not picked up yet): "Received" is always done.
  const reached = progress.current + 1;

  return (
    <View accessibilityLabel={t("order.progress")} style={styles.list}>
      {steps.map((step, index) => {
        const done = index <= reached;
        const now = index === reached;

        return (
          <View key={`${index}:${step}`} style={styles.step}>
            <View style={styles.track}>
              <View style={[styles.dot, done ? styles.dotDone : null]}>
                {now ? <View style={styles.core} /> : null}
              </View>
              {index < steps.length - 1 ? (
                <View
                  style={[
                    styles.line,
                    index < reached ? styles.lineDone : null,
                  ]}
                />
              ) : null}
            </View>
            <Text style={[styles.label, now ? styles.labelNow : null]}>
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const DOT = 16;

const styles = StyleSheet.create({
  list: { paddingVertical: 4 },
  step: { flexDirection: "row", gap: 12, minHeight: 38 },
  track: { width: DOT, alignItems: "center" },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.page,
  },
  dotDone: { borderColor: colors.brand, backgroundColor: colors.brand },
  core: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white },
  line: { flex: 1, width: 2, backgroundColor: colors.line },
  lineDone: { backgroundColor: colors.brand },
  label: { flex: 1, fontSize: 14.5, lineHeight: DOT, color: colors.muted },
  labelNow: { fontWeight: "600", color: colors.ink },
});
