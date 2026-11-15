import {
  configureApp,
  getCustomer,
  isSignedIn,
  updateCustomerProfile,
  type PublicCustomer,
  type PublicSiteInfo,
} from "@estoreclub/app";
import { useSyncExternalStore } from "react";

import { appStorage } from "./storage";
import { setWordsOf } from "./strings";

const STORAGE_KEY = "sample-tech.language";

/**
 * The language the app reads in, and the ones the shop offers. `revision` moves only when the
 * shopper picks one: that is what redraws every screen, as the shop's default arriving must not.
 */
export interface LanguageState {
  current: string | null;
  languages: PublicSiteInfo["languages"];
  revision: number;
}

let state: LanguageState = { current: null, languages: [], revision: 0 };
const listeners = new Set<() => void>();
const storage = appStorage();

function publish(next: LanguageState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useLanguage(): LanguageState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

function apply(code: string): void {
  configureApp({ language: code });
  setWordsOf(code);
}

/** The saved choice, in force before the first read: nothing is fetched in the wrong language. */
export const languageReady: Promise<void> = Promise.resolve(
  storage.getItem(STORAGE_KEY),
)
  .catch(() => null)
  .then((saved) => {
    if (!saved) return;
    apply(saved);
    publish({ ...state, current: saved });
  });

let accountRead = false;

/** What the shop said about itself: its languages, and its default if nothing was picked. */
export function shopLanguages(site: PublicSiteInfo): void {
  const offered = site.languages.some((item) => item.code === state.current);
  const current = offered ? state.current : site.defaultLanguage;

  if (current) setWordsOf(current);
  publish({ ...state, current, languages: site.languages });

  // Signed in from before: the account's language wins over this phone's - once, as the app
  // starts (a phone keeps nothing across restarts yet; the account does).
  if (!accountRead) {
    accountRead = true;
    getCustomer().then(
      (customer) => {
        if (customer) signedInAs(customer);
      },
      () => {},
    );
  }
}

/** The language in force, kept on this device - and on the account, when signed in. */
export function chooseLanguage(code: string): void {
  use(code);
  void isSignedIn()
    .then((yes) => (yes ? updateCustomerProfile({ language: code }) : null))
    .catch(() => {});
}

function use(code: string): void {
  apply(code);
  void Promise.resolve(storage.setItem(STORAGE_KEY, code)).catch(() => {});
  publish({ ...state, current: code, revision: state.revision + 1 });
}

/**
 * Just signed in (or found signed in): read in the language their account keeps, where the shop
 * still offers it; an account that keeps none takes the one in use here.
 */
export function signedInAs(customer: PublicCustomer): void {
  const saved = customer.language;

  if (saved && state.languages.some((item) => item.code === saved)) {
    if (saved !== state.current) use(saved);

    return;
  }
  if (!saved && state.current) {
    void updateCustomerProfile({ language: state.current }).catch(() => {});
  }
}
