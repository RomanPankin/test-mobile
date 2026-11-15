import { StyleSheet, Text, View } from "react-native";

import { colors, heading } from "../../lib/theme";

/**
 * A titled paragraph of a support page. A section whose words a shop has blanked out (its
 * "App\Texts" entry emptied) is left out rather than drawn as an empty heading.
 */
export function InfoSection({ title, body }: { title: string; body: string }) {
  if (!title.trim() && !body.trim()) return null;

  return (
    <View style={styles.section}>
      {title.trim() ? <Text style={styles.title}>{title}</Text> : null}
      {body.trim() ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6, paddingTop: 4 },
  title: { ...heading, fontSize: 18, color: colors.ink },
  body: { fontSize: 15, lineHeight: 23, color: colors.body },
});
