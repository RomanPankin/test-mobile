import { StyleSheet, Text } from "react-native";

import { DeliveryFacts } from "../components/info/DeliveryFacts";
import { InfoPage } from "../components/info/InfoPage";
import { InfoSection } from "../components/info/InfoSection";
import { t, type TextKey } from "../lib/strings";
import { colors, heading } from "../lib/theme";
import { useCatalogue } from "../lib/useCatalogue";

const DELIVERY: [TextKey, TextKey][] = [
  ["delivery.s1.title", "delivery.s1.body"],
  ["delivery.s2.title", "delivery.s2.body"],
  ["delivery.s3.title", "delivery.s3.body"],
  ["delivery.s4.title", "delivery.s4.body"],
];

const RETURNS: [TextKey, TextKey][] = [
  ["returns.s1.title", "returns.s1.body"],
  ["returns.s2.title", "returns.s2.body"],
  ["returns.s3.title", "returns.s3.body"],
  ["returns.s4.title", "returns.s4.body"],
];

/**
 * Delivery & returns - the website's `/delivery`: the facts at a glance, how delivery works,
 * then returns and the warranty. The real fee is the checkout's, from the address.
 */
export default function DeliveryScreen() {
  const { catalogue } = useCatalogue();

  return (
    <InfoPage
      image={catalogue?.images.delivery}
      intro={t("delivery.intro")}
      title={t("delivery.title")}
    >
      <DeliveryFacts />
      {DELIVERY.map(([title, body]) => (
        <InfoSection key={title} body={t(body)} title={t(title)} />
      ))}
      <Text style={styles.heading}>{t("returns.title")}</Text>
      <Text style={styles.intro}>{t("returns.intro")}</Text>
      {RETURNS.map(([title, body]) => (
        <InfoSection key={title} body={t(body)} title={t(title)} />
      ))}
    </InfoPage>
  );
}

const styles = StyleSheet.create({
  heading: { ...heading, marginTop: 16, fontSize: 24, color: colors.ink },
  intro: { marginTop: -8, fontSize: 15, lineHeight: 22, color: colors.body },
});
