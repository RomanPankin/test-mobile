import {
  getCategories,
  getCombos,
  getDictionaries,
  getDiscountRules,
  getProducts,
  getProductSettings,
  getSiteInfo,
  type PublicCategory,
  type PublicCombo,
  type PublicDictionary,
  type PublicDiscountRule,
  type PublicProduct,
  type PublicProductSettingDefinition,
  type PublicSiteInfo,
} from "@estoreclub/app";

import {
  APP_LISTS,
  appImagesOf,
  appTextsOf,
  type AppImages,
} from "./appContent";
import { COLOURS_LIST, coloursOf } from "./colours";
import { languageReady, shopLanguages } from "./language";
import { setShopCurrency } from "./money";
import { setShopTexts, wordsLanguage } from "./strings";
import type { Words } from "./words/en";

const PAGE_SIZE = 100;

/** The shop as this app draws it, read once per launch and shared by every screen. */
export interface Catalogue {
  site: PublicSiteInfo;
  categories: PublicCategory[];
  products: PublicProduct[];
  /** The discount rules on right now, for the cards' deal badges - the bag prices them. */
  rules: PublicDiscountRule[];
  /** The bundles on sale right now - the shop's combos ("Phone 16 Pro Starter Kit"). */
  combos: PublicCombo[];
  /** The swatch of each colour, by its name in lower case - the `Catalog\Colours` list. */
  hexOf: ReadonlyMap<string, string>;
  /** The shop's settings catalogue: the names and units the specifications are listed under. */
  settings: PublicProductSettingDefinition[];
  lists: ReadonlyMap<string, PublicDictionary>;
  /** The shop's "App\Images", over the built-in pictures and the website's. */
  images: AppImages;
  /** The shop's "App\Texts", handed to `t` once this catalogue is the one in use. */
  texts: { language: string; words: Words };
}

async function allProducts(): Promise<PublicProduct[]> {
  const products: PublicProduct[] = [];

  for (let page = 1; ; page += 1) {
    const answer = await getProducts({ page, limit: PAGE_SIZE });

    products.push(...answer.data);

    if (!answer.pagination?.hasNext || answer.data.length === 0) {
      return products;
    }
  }
}

async function read(): Promise<Catalogue> {
  await languageReady;

  // Badges, bundles and the names of specifications are extras: a shop whose rules, combos or
  // settings cannot be read still sells, at the bag's prices and under the app's own words.
  const [site, categories, products, rules, combos, settings] =
    await Promise.all([
      getSiteInfo(),
      getCategories({ include: ["media"] }),
      allProducts(),
      getDiscountRules().catch((): PublicDiscountRule[] => []),
      getCombos().catch((): PublicCombo[] => []),
      getProductSettings().catch((): PublicProductSettingDefinition[] => []),
    ]);
  // The colours' swatches, and the app's words and pictures: without them a colour is a grey
  // dot and the app speaks and draws as it shipped.
  const fetched = await getDictionaries({
    identifiers: [COLOURS_LIST, ...Object.values(APP_LISTS)],
  }).catch((): PublicDictionary[] => []);
  const lists = new Map(
    fetched.map((list) => [list.identifier ?? list.id, list]),
  );

  setShopCurrency(site);
  shopLanguages(site);

  return {
    site,
    categories,
    products,
    rules,
    combos,
    hexOf: coloursOf(lists.get(COLOURS_LIST)),
    settings,
    lists,
    images: appImagesOf(lists),
    // In the language the shop's default may just have settled on.
    texts: { language: wordsLanguage(), words: appTextsOf(lists) },
  };
}

let loaded: Catalogue | null = null;
let loading: Promise<Catalogue> | null = null;

export function loadedCatalogue(): Catalogue | null {
  return loaded;
}

/** The catalogue, asked for once however many screens want it. A failure may be asked again. */
export function loadCatalogue(): Promise<Catalogue> {
  const asked: Promise<Catalogue> = (loading ??= read()
    .then((catalogue) => {
      // Dropped if the language changed meanwhile: `resetCatalogue` has started over.
      if (loading === asked) {
        loaded = catalogue;
        setShopTexts(catalogue.texts.language, catalogue.texts.words);
      }

      return catalogue;
    })
    .catch((error: unknown) => {
      if (loading === asked) loading = null;

      throw error;
    }));

  return asked;
}

/** Forgets the catalogue, which is in one language: the next screen reads it in the new one. */
export function resetCatalogue(): void {
  loaded = null;
  loading = null;
}

export function productById(
  catalogue: Catalogue,
  id: string | undefined,
): PublicProduct | undefined {
  return catalogue.products.find((product) => product.id === id);
}

export function productsInCategory(
  catalogue: Catalogue,
  categoryId: string,
): PublicProduct[] {
  return catalogue.products.filter((product) =>
    product.categories?.some((category) => category?.id === categoryId),
  );
}
