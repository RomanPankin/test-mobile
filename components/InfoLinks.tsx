import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { t, type TextKey } from "../lib/strings";
import { colors, GUTTER, heading } from "../lib/theme";

const PAGES: { label: TextKey; href: Href }[] = [
  { label: "info.delivery", href: "/delivery" },
  { label: "info.faq", href: "/faq" },
  { label: "info.about", href: "/about" },
];

/**
 * The website's support pages, as rows at the foot of the account - signed in or not, since
 * "How much is delivery?" comes before any order.
 */
export function InfoLinks() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t("account.help")}</Text>
      <View style={styles.list}>
        {PAGES.map((page, index) => (
          <Pressable
            key={page.label}
            accessibilityRole="link"
            style={({ pressed }) => [
              styles.row,
              index > 0 ? styles.rule : null,
              pressed ? styles.pressed : null,
            ]}
            onPress={() => router.push(page.href)}
          >
            <Text style={styles.label}>{t(page.label)}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: GUTTER, paddingTop: 28 },
  title: { ...heading, fontSize: 19, color: colors.ink },
  list: {
    marginTop: 12,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.tile,
  },
  row: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  rule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  pressed: { backgroundColor: colors.line },
  label: { fontSize: 15, color: colors.ink },
  chevron: { fontSize: 22, color: colors.muted },
});
