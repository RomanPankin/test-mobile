import { ScrollView } from "react-native";

import { t } from "../lib/strings";

import { Sheet } from "./Sheet";
import { SignInForm } from "./SignInForm";

/** Sign in by emailed code, in a bottom sheet over the screen that asked for it. */
export function SignInSheet({
  visible,
  onClose,
  onSignedIn,
}: {
  visible: boolean;
  onClose: () => void;
  onSignedIn: () => void;
}) {
  return (
    <Sheet title={t("account.verify")} visible={visible} onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {visible ? <SignInForm onSignedIn={onSignedIn} /> : null}
      </ScrollView>
    </Sheet>
  );
}
