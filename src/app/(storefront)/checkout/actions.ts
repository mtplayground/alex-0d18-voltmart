"use server";

import type { CheckoutFormState } from "@/lib/checkout-validation";
import { validateCheckoutFormData } from "@/lib/checkout-validation";

export async function validateCheckoutDetails(
  _previousState: CheckoutFormState,
  formData: FormData,
) {
  return validateCheckoutFormData(formData);
}
