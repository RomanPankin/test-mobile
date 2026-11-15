import type { ReactNode } from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
} from "react-native";

import { colors, GUTTER, heading } from "../../lib/theme";
import { Photo } from "../Photo";

/**
 * One of the website's support pages, as a screen: its title, the line under it, its photo
 * where it has one, then whatever the page says - the website's `ContentPage`.
 */
export function InfoPage({
  title,
  intro,
  image,
  children,
}: {
  title: string;
  intro: string;
  image?: string;
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const photo = width - GUTTER * 2;

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.intro}>{intro}</Text>
      {image ? (
        <Photo
          height={Math.round(photo / 2)}
          radius={14}
          uri={image}
          width={photo}
        />
      ) : null}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.page },
  scroll: { padding: GUTTER, paddingBottom: 48, gap: 16 },
  title: {
    ...heading,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -1,
    color: colors.ink,
  },
  intro: { marginTop: -6, fontSize: 15.5, lineHeight: 23, color: colors.body },
});
