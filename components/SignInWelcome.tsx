import { StyleSheet, Text, View } from "react-native";

import { colors, heading } from "../lib/theme";

import { Logo } from "./Logo";

/**
 * The top of the sign-in screen: the shop's mark on the hero's grey band, its name and a line
 * of welcome - the website's sign-in dialog, as a card.
 */
export function SignInWelcome({
  logo,
  name,
  title,
  subtitle,
}: {
  logo: string | null;
  /** The shop's name, for the mark when it has no picture of its own. */
  name: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.card}>
      <Logo image={logo} name={name} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    borderRadius: 18,
    backgroundColor: colors.band,
  },
  title: {
    marginTop: 16,
    ...heading,
    fontSize: 26,
    lineHeight: 32,
    textAlign: "center",
    color: colors.ink,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.body,
  },
});
