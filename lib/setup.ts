import { configureApp } from "@estoreclub/app";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { appStorage } from "./storage";

/**
 * What the build cannot tell the SDK. `siteUrl` is the shop's website, where the hosted payment
 * page lives: for a phone only, as a browser serves that page on its own address. Empty (nobody
 * has promoted a website yet), a phone pays on the platform's own address instead. Imported
 * once, first, by the root layout.
 */
const siteUrl = Constants.expoConfig?.extra?.siteUrl;

/**
 * Run from Expo's own dev server (`npm run dev:mobile`), not a platform build: no build hands the
 * SDK its shop, so the shop comes from the environment. A platform build defines `process.env`
 * as empty: these are undefined there, and the build's own configuration stands.
 */
// The same name as the website's SERVER_URL (Expo passes only EXPO_PUBLIC_* into an app); the
// older EXPO_PUBLIC_API_URL still works.
const devApiUrl =
  process.env.EXPO_PUBLIC_SERVER_URL ?? process.env.EXPO_PUBLIC_API_URL;
const devAppKey = process.env.EXPO_PUBLIC_APP_KEY;

/**
 * A template's preview of the app (`build-templates.mjs`): the demo store's sample catalogue,
 * read with no key at all. Nobody can pay for a basket there.
 */
const devProductSample = process.env.EXPO_PUBLIC_PRODUCT_SAMPLE;

if (devApiUrl && devAppKey) {
  configureApp({
    apiUrl: devApiUrl,
    appKey: devAppKey,
  });
} else if (devApiUrl && devProductSample) {
  configureApp({
    apiUrl: devApiUrl,
    productSample: devProductSample,
  });
}

configureApp({
  storage: appStorage(),
  ...(Platform.OS !== "web" && typeof siteUrl === "string" && siteUrl
    ? { siteUrl }
    : {}),
});
