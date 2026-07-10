import { NextResponse } from "next/server";

import { getCartBySessionId } from "@/lib/cart";
import { getCartSessionId } from "@/lib/cart-session";
import { getCartItemCount } from "@/lib/cart-summary";

export async function GET() {
  const sessionId = await getCartSessionId();
  const cart = await getCartBySessionId(sessionId ?? undefined);

  return NextResponse.json({
    itemCount: getCartItemCount(cart),
  });
}
