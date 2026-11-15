import {
  addToCart,
  forgetCart,
  readCart,
  removeItem,
  setQuantity,
  type AddToCartParams,
  type PublicCart,
} from "@estoreclub/app";
import { useSyncExternalStore } from "react";

/**
 * The bag, shared by the tab bar's count, the product and bundle screens and the bag itself. Every call answers
 * with the whole bag, so this only ever holds what the server last said.
 */
export interface CartState {
  cart: PublicCart | null;
  status: "idle" | "loading" | "ready" | "failed";
}

let state: CartState = { cart: null, status: "idle" };
const listeners = new Set<() => void>();

function publish(next: CartState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useCart(): CartState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export async function refreshCart(): Promise<void> {
  publish({ ...state, status: "loading" });

  try {
    publish({ cart: await readCart(), status: "ready" });
  } catch {
    publish({ ...state, status: "failed" });
  }
}

/** The bag as the server has it now - read again, for a decision that rests on it. */
export async function currentCart(): Promise<PublicCart | null> {
  await refreshCart();

  return state.cart;
}

export async function addLine(params: AddToCartParams): Promise<void> {
  publish({ cart: await addToCart(params), status: "ready" });
}

export async function changeQuantity(
  cartItemId: string,
  quantity: number,
): Promise<void> {
  publish({
    cart: await (quantity > 0
      ? setQuantity({ cartItemId, quantity })
      : removeItem({ cartItemId })),
    status: "ready",
  });
}

/** Let go of a bag that has been paid: the next add starts a new one. */
export async function startNewCart(): Promise<void> {
  await forgetCart();
  publish({ cart: null, status: "ready" });
}
