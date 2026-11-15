import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ActionButton } from "../components/ActionButton";
import { InfoPage } from "../components/info/InfoPage";
import { InfoSection } from "../components/info/InfoSection";
import { t, type TextKey } from "../lib/strings";
import { colors, heading } from "../lib/theme";
import { useCatalogue } from "../lib/useCatalogue";

const VALUES: [TextKey, TextKey][] = [
  ["about.value.1.title", "about.value.1.text"],
  ["about.value.2.title", "about.value.2.text"],
  ["about.value.3.title", "about.value.3.text"],
  ["about.value.4.title", "about.value.4.text"],
];

/**
 * About us - the website's `/about`, shortened for a phone: the story, the four promises, and
 * the way back to the shop. The shop's own name stands wherever the words say "{brand}".
 */
export default function AboutScreen() {
  const { catalogue } = useCatalogue();
  const brand = catalogue?.site.siteName || "TechStore";

  return (
    <InfoPage
      image={catalogue?.images.about}
      intro={t("about.hero.text")}
      title={`${t("about.hero.title")} ${t("about.hero.titleAccent")}`}
    >
      <InfoSection
        body={`${t("about.story.text1", { brand })}\n\n${t("about.story.text2")}`}
        title={t("about.story.title")}
      />
      <Text style={styles.heading}>{t("about.values.title")}</Text>
      {VALUES.map(([title, text]) => (
        <InfoSection key={title} body={t(text)} title={t(title)} />
      ))}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>{t("about.cta.title")}</Text>
        <Text style={styles.ctaText}>{t("about.cta.text")}</Text>
        <ActionButton
          label={t("about.cta.button")}
          onPress={() => router.navigate("/shop")}
        />
      </View>
    </InfoPage>
  );
}

const styles = StyleSheet.create({
  heading: { ...heading, marginTop: 12, fontSize: 22, color: colors.ink },
  cta: {
    gap: 10,
    marginTop: 12,
    padding: 20,
    borderRadius: 14,
    backgroundColor: colors.band,
  },
  ctaTitle: { ...heading, fontSize: 22, color: colors.ink },
  ctaText: { fontSize: 15, lineHeight: 22, color: colors.body },
});
