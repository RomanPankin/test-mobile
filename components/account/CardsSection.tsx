import {
  deleteCustomerPaymentMethod,
  getCustomerPaymentMethods,
} from "@estoreclub/app";
import { useEffect, useState } from "react";

import { t } from "../../lib/strings";

import { SavedList } from "./SavedList";

type Card = Awaited<
  ReturnType<typeof getCustomerPaymentMethods>
>["data"][number];

/** "Visa", "Mastercard" - Stripe's brand, as people say it. */
function brandName(brand: string): string {
  const named: Record<string, string> = {
    amex: "American Express",
    mastercard: "Mastercard",
    visa: "Visa",
  };

  return named[brand] ?? brand.charAt(0).toUpperCase() + brand.slice(1);
}

/**
 * The cards this customer saved paying here: what they are and when they expire - nothing that
 * can pay. Only shown once there is one: a shopper who never saved a card has no use for an
 * empty list of them. A card an open payment holds cannot be removed until it settles.
 */
export function CardsSection() {
  const [cards, setCards] = useState<Card[] | null>(null);

  useEffect(() => {
    getCustomerPaymentMethods().then(
      (answer) => setCards(answer.data),
      () => {},
    );
  }, []);

  if (!cards || cards.length === 0) return null;

  return (
    <SavedList
      confirmTitle={t("account.removeCard")}
      empty=""
      items={cards.map((card) => ({
        id: card.id,
        title: `${brandName(card.brand)} •••• ${card.last4}`,
        detail: card.inUse
          ? t("account.cardInUse")
          : t("account.cardExpires", {
              date: `${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}`,
            }),
        locked: card.inUse,
      }))}
      text={t("account.cardsText")}
      title={t("account.cards")}
      onRemove={(id) => {
        void deleteCustomerPaymentMethod({ paymentMethodId: id }).then(
          () => setCards((was) => (was ?? []).filter((item) => item.id !== id)),
          () => {},
        );
      }}
    />
  );
}
