import { describe, expect, it } from "vitest";

import { getCartItemCount, getCartLineTotalCents, getCartSubtotalCents } from "@/lib/cart-summary";

const cart = {
  items: [
    {
      quantity: 2,
      product: {
        priceCents: 999,
      },
    },
    {
      quantity: 1,
      product: {
        priceCents: 2500,
      },
    },
  ],
};

describe("cart summary helpers", () => {
  it("counts total item quantity", () => {
    expect(getCartItemCount(cart)).toBe(3);
    expect(getCartItemCount(null)).toBe(0);
  });

  it("calculates cart subtotals in cents", () => {
    expect(getCartSubtotalCents(cart)).toBe(4498);
    expect(getCartSubtotalCents(undefined)).toBe(0);
  });

  it("calculates line totals in cents", () => {
    expect(getCartLineTotalCents(cart.items[0])).toBe(1998);
  });
});
