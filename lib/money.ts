import type { PublicSiteInfo } from "@estoreclub/app";

import { dollarSign, localCountry } from "@estoreclub/storefront";

/**
 * Prices, written the way this shop writes them: its currency, its sign, on the sign's own side.
 *
 * A dollar is a bare "$" only to someone in the shop's own country; anyone else reads whose it
 * is - "NZ$149.00", "USD$12.00" (`dollarSign`) - and an amount in another currency than the
 * shop's carries its code. Seeded from the site info when the catalogue loads, as nothing that
 * draws a price is shown before that.
 */
interface ShopCurrency {
  code: string;
  symbol: string;
  position: "prefix" | "suffix";
  /** Where the shop trades - its people read its dollar as "$". */
  country: string | null;
}

let shop: ShopCurrency = {
  code: "",
  symbol: "",
  position: "prefix",
  country: null,
};

export function setShopCurrency(
  site: Pick<
    PublicSiteInfo,
    "currency" | "currencySymbol" | "currencySymbolPosition" | "countryCode"
  >,
): void {
  const code = (site.currency ?? "").toUpperCase();

  shop = {
    code,
    symbol: site.currencySymbol || code,
    position: site.currencySymbolPosition === "suffix" ? "suffix" : "prefix",
    country: site.countryCode ?? null,
  };
}

/** Whether `Intl` writes this currency with a "$" - the dollars, and the peso's kin. */
function isDollar(code: string): boolean {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    })
      .format(0)
      .includes("$");
  } catch {
    return false;
  }
}

function digitsOf(code: string): number {
  try {
    return (
      new Intl.NumberFormat("en", {
        style: "currency",
        currency: code,
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

/** An amount in whole units of the shop's currency - or of `currency`, an old order's. */
export function money(amount: number, currency?: string): string {
  const code = (currency || shop.code).toUpperCase();
  const digits = digitsOf(code);
  const number = new Intl.NumberFormat("en", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);

  // Another currency than the shop's: a dollar says whose ("USD$12.00"), the rest their code.
  if (code !== shop.code) {
    return code.endsWith("D") && isDollar(code)
      ? `${dollarSign(code, "$", null, localCountry())}${number}`
      : `${code} ${number}`;
  }

  const sign = dollarSign(code, shop.symbol, shop.country, localCountry());

  return shop.position === "suffix" ? `${number} ${sign}` : `${sign}${number}`;
}

/** What a choice adds: "+NZ$2.00". Nothing at all when it is free. */
export function addedPrice(amount: number): string {
  if (amount === 0) return "";

  return `${amount > 0 ? "+" : "-"}${money(Math.abs(amount))}`;
}

/** How many cents make a unit of `currency`, for an order's minor-unit totals. */
export function fromMinorUnits(cents: number, currency: string): number {
  return cents / 10 ** digitsOf(currency.toUpperCase());
}
