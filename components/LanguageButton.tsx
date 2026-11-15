import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { refreshCart } from "../lib/cartStore";
import { resetCatalogue } from "../lib/catalogue";
import { chooseLanguage, useLanguage } from "../lib/language";
import { t } from "../lib/strings";
import { colors } from "../lib/theme";

import { ActionSheet } from "./ActionSheet";
import { HeaderButton } from "./HeaderButton";

/** Long enough for the sheet to slide away: a language picked redraws every screen. */
const SHEET_CLOSE_MS = 300;

/** The language in use, and an action sheet of the shop's others. Nothing for a shop with just one. */
export function LanguageButton({ floating }: { floating?: boolean }) {
  const { current, languages } = useLanguage();
  const [open, setOpen] = useState(false);

  if (languages.length < 2) return null;

  const shown = languages.find((item) => item.code === current);
  const pick = (code: string) => {
    if (code === current) return;
    setTimeout(() => {
      resetCatalogue();
      chooseLanguage(code);
      void refreshCart();
    }, SHEET_CLOSE_MS);
  };

  return (
    <>
      <HeaderButton
        floating={floating}
        label={t("common.language")}
        onPress={() => setOpen(true)}
      >
        <Text numberOfLines={1} style={styles.code}>
          {shown?.codeLocal ?? current}
        </Text>
      </HeaderButton>
      <ActionSheet
        cancelLabel={t("common.cancel")}
        options={languages.map((item) => ({
          key: item.code,
          label: item.name,
          checked: item.code === current,
        }))}
        title={t("common.language")}
        visible={open}
        onClose={() => setOpen(false)}
        onPick={pick}
      />
    </>
  );
}

const styles = StyleSheet.create({
  code: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: colors.ink,
  },
});
