"use server";

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
  return submitOrderForCurrentSession(formData);
}
