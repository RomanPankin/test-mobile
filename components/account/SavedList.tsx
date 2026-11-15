import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { t } from "../../lib/strings";
import { colors, GUTTER, heading } from "../../lib/theme";
import { ActionSheet } from "../ActionSheet";

export interface SavedItem {
  id: string;
  title: string;
  detail?: string;
  /** Kept by the server for now (a card an open payment holds): no Remove beside it. */
  locked?: boolean;
}

/**
 * Something the account keeps - its delivery addresses, its saved cards - as a titled list,
 * each with a Remove that asks first. Says `empty` when there is nothing, and nothing at all
 * while the list has not been read (`items` null).
 */
export function SavedList({
  title,
  text,
  empty,
  items,
  confirmTitle,
  onRemove,
}: {
  title: string;
  text: string;
  empty: string;
  items: SavedItem[] | null;
  confirmTitle: string;
  onRemove: (id: string) => void;
}) {
  const [removing, setRemoving] = useState<string | null>(null);

  if (!items) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {items.length === 0 ? <Text style={styles.empty}>{empty}</Text> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.words}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.detail ? (
              <Text style={styles.detail}>{item.detail}</Text>
            ) : null}
          </View>
          {item.locked ? null : (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setRemoving(item.id)}
            >
              <Text style={styles.remove}>{t("account.remove")}</Text>
            </Pressable>
          )}
        </View>
      ))}
      <ActionSheet
        cancelLabel={t("common.cancel")}
        options={[
          { key: "remove", label: t("account.remove"), destructive: true },
        ]}
        title={confirmTitle}
        visible={removing !== null}
        onClose={() => setRemoving(null)}
        onPick={() => {
          if (removing) onRemove(removing);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: GUTTER, paddingTop: 28 },
  title: { ...heading, fontSize: 19, color: colors.ink },
  text: { marginTop: 3, fontSize: 13.5, lineHeight: 19, color: colors.muted },
  empty: { marginTop: 12, fontSize: 14, lineHeight: 20, color: colors.body },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.tile,
  },
  words: { flex: 1 },
  itemTitle: { fontSize: 14.5, fontWeight: "500", color: colors.ink },
  detail: { marginTop: 2, fontSize: 13, color: colors.muted },
  remove: { fontSize: 13.5, fontWeight: "600", color: colors.danger },
});
