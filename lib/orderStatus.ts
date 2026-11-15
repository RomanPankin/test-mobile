import type { PublicCustomerOrder } from "@estoreclub/app";

import { hasText, t } from "./strings";

/**
 * Where an order stands, in one phrase: a parcel's own step while it is out with the courier
 * ("On its way"), else the order's - in progress, completed, cancelled. A delivery state the
 * app has no words for (a newer server's) falls back to the order's.
 */
export function orderStatus(order: PublicCustomerOrder): string {
  const delivery = order.deliveryStatus
    ? `order.delivery.${order.deliveryStatus}`
    : null;

  if (order.status === "open" && delivery && hasText(delivery)) {
    return t(delivery);
  }

  return t(`account.status.${order.status}`);
}
