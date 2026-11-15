import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

import { t } from "../lib/strings";
import { colors, heading } from "../lib/theme";

import { ActionButton } from "./ActionButton";

/** A whole screen with nothing to show yet: still loading, empty, or failed with a way back. */
export function StateView({
  title,
  message,
  action,
  onAction,
  illustration,
}: {
  /** A picture over the words, on the grey tile the product photos sit on. */
  illustration?: string;
  title: string;
  message?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.center}>
      {illustration ? (
        <Image
          accessibilityIgnoresInvertColors
          source={{ uri: illustration }}
          style={styles.illustration}
        />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action && onAction ? (
        <View style={styles.action}>
          <ActionButton label={action} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.ink} size="large" />
    </View>
  );
}

export function FailedView({ onRetry }: { onRetry: () => void }) {
  return (
    <StateView
      action={t("common.retry")}
      message={t("common.failedMessage")}
      title={t("common.failedTitle")}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: colors.page,
  },
  illustration: {
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: colors.tile,
    marginBottom: 20,
  },
  title: {
    ...heading,
    fontSize: 24,
    color: colors.ink,
    textAlign: "center",
  },
  message: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
  },
  action: { marginTop: 24 },
});
