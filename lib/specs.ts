import type {
  PublicProduct,
  PublicProductSettingDefinition,
} from "@estoreclub/app";

import { paragraphsOf, specSheetOf, type SpecGroup } from "./richText";
import { hasText, t } from "./strings";

/**
 * A product's specifications - the website's `lib/productSpecs.ts`, on the app's SDK: every
 * field the shop fills in and lets its shop fronts read, in the order of its settings catalogue.
 *
 * Data-driven rather than a fixed list: a shop that adds "Battery" or "Screen size" to its
 * product type sees it here without a line of the app changing.
 *
 * Left out: what the screen already says elsewhere (the badge, the colours and their prices,
 * the warranty in the promises under the price, the overview and the spec sheet - sections of
 * their own), long text, a field nobody filled in, and a yes/no field that is off - "Water
 * resistant: No" is not a selling point.
 */
const SHOWN_ELSEWHERE = new Set([
  "BADGE",
  "DESCRIPTION",
  "COLOUR",
  "PRICE",
  "WARRANTY_MONTHS",
  "DISCOUNT",
  "OVERVIEW",
  "SPECIFICATIONS",
]);

type Setting = NonNullable<PublicProduct["settings"]>[string];

/**
 * One line of the specifications. Raw on purpose: the words around it ("Brand", "Yes") are the
 * app's, in the shopper's language, put on where it is drawn.
 */
export interface Spec {
  key: string;
  /** The shop's own name for the field ("Warranty"), for a key the app's words do not name. */
  label: string;
  /** A number, the text (list entries joined), or `true` for a yes/no field that is on. */
  value: string | number | true;
  /** The unit the shop writes after a number ("g", "mAh"). */
  suffix?: string;
}

function valueOf(setting: Setting): Spec["value"] | null {
  const { value } = setting;

  if (setting.type === "richtext" || value === "" || value === false)
    return null;
  if (value === null || value === undefined) return null;
  if (value === true) return true;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") return value.trim() || null;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ") || null;

  // A range - where the product sits on its scale.
  return `${value.value}/${value.max}`;
}

export function specsOf(
  product: PublicProduct,
  definitions: readonly PublicProductSettingDefinition[],
): Spec[] {
  const known = new Map(
    definitions.map((definition, order) => [
      definition.key,
      { definition, order },
    ]),
  );
  const specs: Spec[] = [];

  for (const [key, setting] of Object.entries(product.settings ?? {})) {
    if (SHOWN_ELSEWHERE.has(key) || !setting) continue;

    const value = valueOf(setting);

    if (value === null) continue;

    const named = known.get(key)?.definition;

    specs.push({
      key,
      label: named?.label || setting.listName || key,
      value,
      ...(named?.suffix && typeof value === "number"
        ? { suffix: named.suffix }
        : {}),
    });
  }

  // The catalogue's order; a key it does not list (it can lag a field just added) goes last.
  const rank = (key: string) =>
    known.get(key)?.order ?? Number.MAX_SAFE_INTEGER;

  return specs.sort((a, b) => rank(a.key) - rank(b.key));
}

/** Months of warranty (`WARRANTY_MONTHS`), 0 when the shop gave none. */
export function warrantyMonths(product: PublicProduct): number {
  const months = Number(product.settings?.WARRANTY_MONTHS?.value);

  return Number.isFinite(months) && months > 0 ? months : 0;
}

/** The maker (`BRAND`), or nothing. */
export function brandOf(product: PublicProduct): string {
  const value = product.settings?.BRAND?.value;

  return typeof value === "string" ? value.trim() : "";
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** The long description (`OVERVIEW`), a paragraph each - plain text, as the website's page. */
export function overviewOf(product: PublicProduct): string[] {
  return paragraphsOf(text(product.settings?.OVERVIEW?.value));
}

/**
 * Everything the product's page lists under "Tech specs": its fields (`specsOf`) as a first
 * group, in the app's words, then the shop's own spec sheet (`SPECIFICATIONS`) grouped the way
 * buyers compare them - display, battery, size and weight.
 */
export function specGroupsOf(
  product: PublicProduct,
  definitions: readonly PublicProductSettingDefinition[],
): SpecGroup[] {
  const fields = specsOf(product, definitions).map(specRow);
  const sheet = specSheetOfProduct(product);

  return fields.length > 0
    ? [{ title: t("spec.general"), rows: fields }, ...sheet]
    : sheet;
}

/** The shop's own spec sheet (`SPECIFICATIONS`) alone, grouped - what a bundle's item lists. */
export function specSheetOfProduct(product: PublicProduct): SpecGroup[] {
  return specSheetOf(text(product.settings?.SPECIFICATIONS?.value));
}

/** One field as a row: its name in the app's words where it has them ("Brand"), else the shop's. */
function specRow(spec: Spec): SpecGroup["rows"][number] {
  const key = `spec.${spec.key}`;
  const value =
    spec.value === true
      ? t("spec.yes")
      : spec.suffix
        ? `${spec.value} ${spec.suffix}`
        : String(spec.value);

  return { label: hasText(key) ? t(key) : spec.label, value };
}
