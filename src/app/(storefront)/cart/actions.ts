"use server";

import { revalidatePath } from "next/cache";

import {
  addCartItemForCurrentSession,
  removeCartItemForCurrentSession,
  updateCartItemQuantityForCurrentSession,
} from "@/lib/cart-actions";

function revalidateCartViews() {
  revalidatePath("/");
  revalidatePath("/cart");
}

export async function addCartItem(productId: string, quantity = 1) {
  const result = await addCartItemForCurrentSession({ productId, quantity });

  if (result.ok) {
    revalidateCartViews();
  }

  return result;
}

export async function updateCartItemQuantity(productId: string, quantity: number) {
  const result = await updateCartItemQuantityForCurrentSession({ productId, quantity });

  if (result.ok) {
    revalidateCartViews();
  }

  return result;
}

export async function removeCartItem(productId: string) {
  const result = await removeCartItemForCurrentSession({ productId });

  if (result.ok) {
    revalidateCartViews();
  }

  return result;
}

export async function submitAddCartItem(productId: string, quantity = 1) {
  await addCartItem(productId, quantity);
}

export async function submitCartItemQuantityUpdate(productId: string, quantity: number) {
  await updateCartItemQuantity(productId, quantity);
}

export async function submitCartItemRemoval(productId: string) {
  await removeCartItem(productId);
}
