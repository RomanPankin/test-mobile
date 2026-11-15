import { router } from "expo-router";
import { useEffect } from "react";

/**
 * Where the platform's Google page comes back to on a phone (`<scheme>://google-sign-in`). The
 * sign-in itself takes the answer from its browser sheet (`signInWithGoogleOnPhone`); the
 * router opens this screen for it too, and it only steps aside - back where the shopper was, or
 * to their account when the app had been closed meanwhile.
 */
export default function GoogleSignInReturn() {
  useEffect(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/account");
  }, []);

  return null;
}
