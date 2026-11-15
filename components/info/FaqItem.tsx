import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { animateFold } from "../../lib/animateFold";
import { colors } from "../../lib/theme";

/** One question, folded: tapped, its answer opens under it - the website's `FaqList`. */
export function FaqItem({
  question,
  answer,
  first,
}: {
  question: string;
  answer: string;
  first: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={first ? null : styles.rule}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.question}
        onPress={() => {
          animateFold();
          setOpen((was) => !was);
        }}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Text style={styles.sign}>{open ? "-" : "+"}</Text>
      </Pressable>
      {open ? <Text style={styles.answer}>{answer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rule: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  question: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 15.5,
    lineHeight: 21,
    fontWeight: "500",
    color: colors.ink,
  },
  sign: { width: 18, fontSize: 20, textAlign: "center", color: colors.muted },
  answer: {
    paddingBottom: 16,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.body,
  },
});
