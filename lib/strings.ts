import { useSyncExternalStore } from "react";

import { en, type TextKey, type Words } from "./words/en";
import { ru } from "./words/ru";

export type { TextKey } from "./words/en";

/** Values put into a text: `{count}`, `{name}`, `{price}`. */
export type TextVars = Record<string, string | number>;

const BUILT_IN: Record<string, Words> = { en, ru };

/**
 * Every word the app says itself, in the language in use: the shop's own from its "App\Texts"
 * list where it has the key, the built-in words otherwise - so a key the shop deleted, or one a
 * newer app added, reads as shipped and never as the key. What the shop sells (products,
 * categories) comes from the SDK.
 *
 * Module state, not context: the cart store and the badge helpers speak too, outside React.
 * `setWordsOf` follows the language, `setShopTexts` the list as the catalogue reads it; the
 * root layout redraws the app on either.
 */
let language = "en";
let builtIn: Words = en;
/** The shop's list, and the language it was read in: it stands only for that language. */
let shop: { language: string; texts: Words } | null = null;
let version = 0;
const listeners = new Set<() => void>();

function changed(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}

/** A language the app has no words for reads in English; the shop's own words still translate. */
export function setWordsOf(code: string): void {
  const base = code.split("-")[0];

  if (base === language) return;
  language = base;
  builtIn = BUILT_IN[base] ?? en;
  changed();
}

/** The shop's "App\Texts", key → text, as read in `code`. */
export function setShopTexts(code: string, texts: Words): void {
  shop = { language: code.split("-")[0], texts };
  changed();
}

/** Redraws a component when the words change: the language, or the shop's list arriving. */
export function useTexts(): number {
  return useSyncExternalStore(
    subscribe,
    () => version,
    () => version,
  );
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/** The plural form of `count` in the language in use: `one`, `few`, `many`, `other`... */
function pluralForm(count: number): string {
  try {
    return new Intl.PluralRules(language).select(count);
  } catch {
    // An engine without plural rules still tells one from many.
    return count === 1 ? "one" : "other";
  }
}

/** The text under one exact key in the language in use: the shop's before the built-in. */
function inLanguage(key: string): string | undefined {
  const own = shop?.language === language ? shop.texts[key] : undefined;

  return own ?? builtIn[key];
}

/**
 * The first of `keys` with words: every one in the language in use before any in English - so
 * a Russian "1 комментарий" falls to Russian's `other`, not to English's `one`.
 */
function lookup(keys: string[]): string | undefined {
  for (const read of [inLanguage, (key: string) => (en as Words)[key]]) {
    for (const key of keys) {
      const found = read(key);

      if (found !== undefined) return found;
    }
  }

  return undefined;
}

/** The keys to try for `key`: its plural form, then `other`, when it counts something. */
function candidates(key: string, vars?: TextVars): string[] {
  const count = vars?.count;

  if (typeof count !== "number") return [key];

  return [`${key}.${pluralForm(count)}`, `${key}.other`, key];
}

function fill(text: string, vars?: TextVars): string {
  if (!vars) return text;

  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/**
 * The words for `key` with its `{placeholders}` filled: `t("account.items", { count: 2 })`.
 * A `count` var also picks the plural form.
 */
export function t(key: TextKey, vars?: TextVars): string {
  const found = lookup(candidates(key, vars));

  return found === undefined ? key : fill(found, vars);
}

/** Whether `key` has words - for a key built from data, like an order's status. */
export function hasText(key: string): key is TextKey {
  return lookup([key, `${key}.other`]) !== undefined;
}

/** The language the words are in now - what a list read just now was answered in. */
export function wordsLanguage(): string {
  return language;
}
