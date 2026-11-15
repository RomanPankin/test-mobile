import type { PublicSiteInfo } from "@estoreclub/app";

import {
  finishGoogleSignIn,
  signInWithGoogle,
  startGoogleSignIn,
} from "@estoreclub/app";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

/** What the platform's Google page posts back - see `PublicSiteInfo.googleSignInUrl`. */
const CREDENTIAL_MESSAGE = "salespoint:google-credential";

interface PopupWindow {
  closed: boolean;
}

interface Page {
  location: { origin: string };
  open(url: string, name: string, features: string): PopupWindow | null;
  addEventListener(
    type: "message",
    listener: (event: PostedMessage) => void,
  ): void;
  removeEventListener(
    type: "message",
    listener: (event: PostedMessage) => void,
  ): void;
}

interface PostedMessage {
  origin: string;
  data: unknown;
}

/** A refusal the shopper can act on: the popup was blocked. */
export class GooglePopupBlocked extends Error {}

/** Where the platform's Google page comes back to on a phone: this app's own address. */
const RETURN_PATH = "google-sign-in";

/** This app's link scheme (`app.json`), which the phone opens it by. */
function appScheme(): string | null {
  const scheme = Constants.expoConfig?.scheme;
  const first = Array.isArray(scheme) ? scheme[0] : scheme;

  return typeof first === "string" && first ? first : null;
}

/**
 * How this app can sign in with Google: the platform's page and client, when the shop allows it.
 *
 * Google is drawn on the platform's one registered page. In a browser - the preview, a
 * home-screen app - it opens in a popup and hands the token back by `postMessage`
 * (`signInWithGooglePopup`). A phone's app opens it in its own browser sheet, and it comes back
 * through the app's own scheme (`signInWithGoogleOnPhone`) - so a phone needs one.
 */
export function googleSignIn(
  site: PublicSiteInfo,
): { clientId: string; url: string } | null {
  if (!site.customerSignInMethods?.google) return null;
  if (!site.googleClientId || !site.googleSignInUrl) return null;
  if (Platform.OS === "web") {
    if (!(globalThis as { window?: Page }).window) return null;
  } else if (!appScheme()) {
    return null;
  }

  return { clientId: site.googleClientId, url: site.googleSignInUrl };
}

/**
 * A phone's Google sign-in: the platform's page in the app's own browser sheet (an auth
 * session - Safari's sign-in sheet on iOS, a Custom Tab on Android), never the phone's browser
 * app. Google refuses a plain web view, but signs in there; the sheet closes itself once the
 * page comes back to `<scheme>://google-sign-in?credential=...`. The token alone signs nobody
 * in - the ticket the server gave at the start must go with it (`startGoogleSignIn`), and only
 * this call holds it. Resolves true once signed in, false when the shopper closed the sheet.
 */
export async function signInWithGoogleOnPhone(params: {
  clientId: string;
  url: string;
  language: string | null;
}): Promise<boolean> {
  const returnUrl = `${appScheme()}://${RETURN_PATH}`;
  const start = await startGoogleSignIn({
    signInUrl: params.url,
    clientId: params.clientId,
    returnUrl,
    language: params.language,
  });
  const result = await WebBrowser.openAuthSessionAsync(start.url, returnUrl);

  if (result.type !== "success" || !result.url.startsWith(returnUrl)) {
    return false;
  }

  await finishGoogleSignIn({ returnedUrl: result.url, ticket: start.ticket });

  return true;
}

/** Whether a shopper can sign in here at all: by email, or with Google where this app can. */
export function canSignIn(site: PublicSiteInfo): boolean {
  return (
    Boolean(site.customerSignInMethods?.email) || googleSignIn(site) !== null
  );
}

/**
 * Opens the platform's Google page in a popup and signs in with the token it posts back.
 * Resolves true once signed in, false when the shopper closed the popup instead.
 */
export function signInWithGooglePopup(params: {
  clientId: string;
  url: string;
  language: string | null;
}): Promise<boolean> {
  const page = (globalThis as { window?: Page }).window as Page;
  const url = new URL(params.url);
  const pageOrigin = url.origin;

  url.searchParams.set("origin", page.location.origin);
  url.searchParams.set("client", params.clientId);
  if (params.language) url.searchParams.set("lang", params.language);

  const popup = page.open(
    url.toString(),
    "salespoint-google-sign-in",
    "popup,width=460,height=560",
  );

  if (!popup) return Promise.reject(new GooglePopupBlocked());

  return new Promise((resolve, reject) => {
    let done = false;
    const finish = () => {
      done = true;
      clearInterval(watch);
      page.removeEventListener("message", onMessage);
    };
    const onMessage = (event: PostedMessage) => {
      if (event.origin !== pageOrigin) return;

      const data = event.data as { type?: string; credential?: string } | null;

      if (data?.type !== CREDENTIAL_MESSAGE || !data.credential) return;
      finish();
      signInWithGoogle({ idToken: data.credential }).then(
        () => resolve(true),
        reject,
      );
    };
    // Closed without signing in: nothing to wait for.
    const watch = setInterval(() => {
      if (popup.closed && !done) {
        finish();
        resolve(false);
      }
    }, 500);

    page.addEventListener("message", onMessage);
  });
}
