export type CartSummarySource = Readonly<{
  items: ReadonlyArray<{
    quantity: number;
    product: {
      priceCents: number;
    };
  }>;
}>;

export function getCartItemCount(cart: CartSummarySource | null | undefined) {
  return cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

export function getCartSubtotalCents(cart: CartSummarySource | null | undefined) {
  return (
    cart?.items.reduce((total, item) => total + item.quantity * item.product.priceCents, 0) ?? 0
  );
}

export function getCartLineTotalCents(item: CartSummarySource["items"][number]) {
  return item.quantity * item.product.priceCents;
}
