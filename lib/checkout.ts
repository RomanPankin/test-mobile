import { createCheckout } from "@estoreclub/app";
import { Linking, Platform } from "react-native";

/**
 * Send the shopper to the shop's hosted payment page, where the delivery address is asked, the
 * delivery priced from it and the card taken - all of it the platform's page, none of it the
 * app's, as on the website.
 *
 * In a browser it replaces this page, and comes back to `/paid`, which lets go of the bag. A
 * phone opens it in the browser: the server keeps only return addresses on the shop's own hosts,
 * so a phone gets the page's own confirmation and comes back by itself.
 */
export async function openCheckout(): Promise<void> {
  const page = (
    globalThis as { location?: { origin?: string; assign(url: string): void } }
  ).location;

  if (Platform.OS === "web" && page?.origin) {
    const checkout = await createCheckout({
      successUrl: `${page.origin}/paid`,
      cancelUrl: `${page.origin}/cart`,
    });

    page.assign(checkout.checkoutUrl);

    return;
  }

  const checkout = await createCheckout();

  await Linking.openURL(checkout.checkoutUrl);
}
