import {
  getCustomer,
  requestSignInCode,
  verifySignInCode,
} from "@estoreclub/app";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { messageOf } from "../lib/errors";
import {
  GooglePopupBlocked,
  googleSignIn,
  signInWithGoogleOnPhone,
  signInWithGooglePopup,
} from "../lib/googleSignIn";
import { signedInAs, useLanguage } from "../lib/language";
import { t } from "../lib/strings";
import { colors, GUTTER } from "../lib/theme";
import { useCatalogue } from "../lib/useCatalogue";

import { ActionButton } from "./ActionButton";
import { CodeBoxes } from "./CodeBoxes";
import { GoogleButton } from "./GoogleButton";
import { SignInWelcome } from "./SignInWelcome";

/**
 * Sign in: the shop's welcome, then Google (where the shop takes it and this app can open it)
 * and the emailed six-digit code - the address, then the code, in six boxes.
 */
export function SignInForm({ onSignedIn }: { onSignedIn: () => void }) {
  const shop = useCatalogue();
  const { current: language } = useLanguage();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const site = shop.catalogue?.site;
  const google = site ? googleSignIn(site) : null;
  const byEmail = Boolean(site?.customerSignInMethods?.email);

  const run = async (step: () => Promise<void>) => {
    setBusy(true);
    setError(null);

    try {
      await step();
    } catch (failure) {
      setError(
        failure instanceof GooglePopupBlocked
          ? t("account.googleBlocked")
          : messageOf(failure),
      );
    } finally {
      setBusy(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      await requestSignInCode({ email: email.trim() });
      setSent(true);
    });
  const verify = (typed = code) =>
    run(async () => {
      signedInAs(await verifySignInCode({ email: email.trim(), code: typed }));
      onSignedIn();
    });
  const withGoogle = () =>
    google
      ? run(async () => {
          const signIn =
            Platform.OS === "web"
              ? signInWithGooglePopup
              : signInWithGoogleOnPhone;

          if (await signIn({ ...google, language })) {
            // The account's language, now it is known whose it is.
            void getCustomer().then(
              (customer) => customer && signedInAs(customer),
              () => {},
            );
            onSignedIn();
          }
        })
      : undefined;

  return (
    <View style={styles.form}>
      <SignInWelcome
        logo={shop.catalogue?.images.logo ?? null}
        name={site?.siteName ?? ""}
        subtitle={
          sent
            ? t("account.codeSentTo", { email: email.trim() })
            : t("account.welcomeSubtitle")
        }
        title={
          sent
            ? t("account.codeTitle")
            : site?.siteName
              ? t("account.welcomeTitle", { name: site.siteName })
              : t("account.welcome")
        }
      />

      {sent ? (
        <View style={styles.step}>
          <CodeBoxes
            value={code}
            onChange={setCode}
            onComplete={(typed) => void verify(typed)}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ActionButton
            busy={busy}
            disabled={code.length < 6}
            label={t("account.verify")}
            onPress={() => void verify()}
          />
          {/* A way back, not a second action: quiet text under the button. */}
          <Pressable
            accessibilityRole="button"
            style={styles.otherEmail}
            onPress={() => {
              setSent(false);
              setCode("");
              setError(null);
            }}
          >
            <Text style={styles.otherEmailText}>{t("account.otherEmail")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.step}>
          {google ? (
            <GoogleButton busy={busy} onPress={() => void withGoogle()} />
          ) : null}
          {google && byEmail ? (
            <View style={styles.or}>
              <View style={styles.rule} />
              <Text style={styles.orText}>{t("account.or")}</Text>
              <View style={styles.rule} />
            </View>
          ) : null}
          {byEmail ? (
            <>
              <Text style={styles.label}>{t("common.email")}</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder={t("account.emailPlaceholder")}
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={() => void sendCode()}
              />
              <Text style={styles.hint}>{t("account.intro")}</Text>
            </>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {byEmail ? (
            <ActionButton
              busy={busy}
              disabled={!email.includes("@")}
              label={t("account.sendCode")}
              onPress={() => void sendCode()}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { padding: GUTTER, gap: 24 },
  step: { gap: 12 },
  or: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  rule: { flex: 1, height: 1, backgroundColor: colors.line },
  orText: { fontSize: 13, color: colors.muted },
  label: { fontSize: 13, fontWeight: "600", color: colors.ink },
  input: {
    height: 52,
    paddingHorizontal: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    fontSize: 16,
    color: colors.ink,
  },
  hint: { fontSize: 13, lineHeight: 19, color: colors.muted },
  error: { fontSize: 14, lineHeight: 20, color: colors.danger },
  otherEmail: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  otherEmailText: { fontSize: 15, fontWeight: "600", color: colors.ink },
});
