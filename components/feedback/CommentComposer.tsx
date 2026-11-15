import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { messageOf } from "../../lib/errors";
import { t } from "../../lib/strings";
import { colors } from "../../lib/theme";
import { ActionButton } from "../ActionButton";

/** As the server caps it - see `createProductComment`. */
const MAX_LENGTH = 2000;

/**
 * The line a comment or a reply is written on. A guest gets the way to sign in in its place:
 * only a signed-in customer may write, and a box that refuses at the last moment wastes what
 * they typed.
 */
export function CommentComposer({
  placeholder,
  submitLabel,
  signedIn,
  focusOnMount = false,
  onSignIn,
  onSubmit,
}: {
  placeholder: string;
  submitLabel: string;
  signedIn: boolean;
  /** A reply's box, opened by its Reply: the keyboard comes up with it. */
  focusOnMount?: boolean;
  onSignIn: () => void;
  /** Rejects with the server's refusal, which is shown under the box; what was typed stays. */
  onSubmit: (body: string) => Promise<void>;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const focused = useRef(false);
  // A callback ref, typed by the one thing it uses: the editor declares `TextInput` as a value
  // only, so a `useRef<TextInput>` would not type-check there. Once, so a redraw never steals
  // the focus back from wherever the customer went.
  const focusOnce = (node: { focus: () => void } | null) => {
    if (!node || !focusOnMount || focused.current) return;
    focused.current = true;
    node.focus();
  };

  if (!signedIn) {
    return (
      <View style={styles.guest}>
        <ActionButton
          label={t("feedback.signInToComment")}
          tone="quiet"
          onPress={onSignIn}
        />
      </View>
    );
  }

  const send = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(body);
      setBody("");
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.composer}>
      <TextInput
        ref={focusOnce}
        multiline
        maxLength={MAX_LENGTH}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={body}
        onChangeText={setBody}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {body.trim() ? (
        <View style={styles.actions}>
          <ActionButton
            busy={busy}
            label={submitLabel}
            onPress={() => void send()}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  guest: { alignItems: "flex-start" },
  composer: { gap: 10 },
  input: {
    minHeight: 48,
    maxHeight: 160,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
    textAlignVertical: "top",
  },
  actions: { alignItems: "flex-end" },
  error: { fontSize: 13.5, lineHeight: 19, color: colors.danger },
});
