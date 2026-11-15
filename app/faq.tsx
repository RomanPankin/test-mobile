import { Linking, StyleSheet, Text, View } from "react-native";

import { ActionButton } from "../components/ActionButton";
import { FaqItem } from "../components/info/FaqItem";
import { InfoPage } from "../components/info/InfoPage";
import { t, type TextKey } from "../lib/strings";
import { colors, heading } from "../lib/theme";

const QUESTIONS: [TextKey, TextKey][] = [
  ["faq.q1", "faq.a1"],
  ["faq.q2", "faq.a2"],
  ["faq.q3", "faq.a3"],
  ["faq.q4", "faq.a4"],
  ["faq.q5", "faq.a5"],
  ["faq.q6", "faq.a6"],
  ["faq.q7", "faq.a7"],
  ["faq.q8", "faq.a8"],
];

/**
 * The questions asked most - the website's `/faq` - each folded until tapped, and a way to
 * write to the shop at the foot. A question a shop blanked out is left out.
 */
export default function FaqScreen() {
  const shown = QUESTIONS.filter(([question]) => t(question).trim());

  return (
    <InfoPage intro={t("faq.intro")} title={t("faq.title")}>
      <View>
        {shown.map(([question, answer], index) => (
          <FaqItem
            key={question}
            answer={t(answer)}
            first={index === 0}
            question={t(question)}
          />
        ))}
      </View>
      <View style={styles.more}>
        <Text style={styles.moreTitle}>{t("faq.more")}</Text>
        <ActionButton
          label={t("faq.contact")}
          tone="quiet"
          onPress={() =>
            void Linking.openURL(t("faq.contactUrl")).catch(() => {})
          }
        />
      </View>
    </InfoPage>
  );
}

const styles = StyleSheet.create({
  more: {
    gap: 12,
    marginTop: 8,
    padding: 18,
    borderRadius: 14,
    backgroundColor: colors.tile,
  },
  moreTitle: { ...heading, fontSize: 18, color: colors.ink },
});
