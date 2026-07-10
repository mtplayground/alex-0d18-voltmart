"use server";

import { redirect } from "next/navigation";

import type { CheckoutFormState } from "@/lib/checkout-validation";
import { validateCheckoutFormData } from "@/lib/checkout-validation";
import { submitOrderForCurrentSession } from "@/lib/order-actions";

export async function validateCheckoutDetails(
  _previousState: CheckoutFormState,
  formData: FormData,
) {
  return validateCheckoutFormData(formData);
}

export async function submitCheckoutOrder(_previousState: CheckoutFormState, formData: FormData) {
  const state = await submitOrderForCurrentSession(formData);

  if (state.status === "success" && state.orderNumber) {
    redirect(`/orders/${encodeURIComponent(state.orderNumber)}`);
  }

  return state;
}
