import { describe, expect, it } from "vitest";

import {
  emptyCheckoutFormValues,
  validateCheckoutFormData,
  validateCheckoutValues,
  valuesFromCheckoutFormData,
} from "@/lib/checkout-validation";

const validValues = {
  customerName: "Taylor Morgan",
  customerEmail: "taylor@example.com",
  customerPhone: "555-123-4567",
  shippingName: "Taylor Morgan",
  shippingAddressLine1: "100 Market Street",
  shippingAddressLine2: "Suite 8",
  shippingCity: "Denver",
  shippingRegion: "CO",
  shippingPostalCode: "80202",
  shippingCountry: "United States",
};

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("checkout validation", () => {
  it("accepts complete guest checkout details", () => {
    expect(validateCheckoutValues(validValues)).toEqual({
      success: true,
      errors: {},
    });
  });

  it("rejects missing required fields and invalid email", () => {
    const values = {
      ...emptyCheckoutFormValues,
      customerEmail: "not-email",
    };

    expect(validateCheckoutValues(values)).toEqual({
      success: false,
      errors: expect.objectContaining({
        customerName: "Name is required",
        customerEmail: "Enter a valid email address",
        shippingAddressLine1: "Address line 1 is required",
      }),
    });
  });

  it("rejects malformed optional phone numbers", () => {
    expect(validateCheckoutValues({ ...validValues, customerPhone: "abc" }).errors).toEqual({
      customerPhone: "Enter a valid phone number",
    });
  });

  it("trims form data values", () => {
    const values = valuesFromCheckoutFormData(
      createFormData({
        ...validValues,
        customerName: "  Taylor Morgan  ",
      }),
    );

    expect(values.customerName).toBe("Taylor Morgan");
  });

  it("returns an error state from invalid form data", () => {
    expect(validateCheckoutFormData(createFormData({}))).toMatchObject({
      status: "error",
      message: "Review the highlighted fields",
      errors: {
        customerName: "Name is required",
      },
    });
  });

  it("returns a success state from valid form data", () => {
    expect(validateCheckoutFormData(createFormData(validValues))).toMatchObject({
      status: "success",
      message: "Checkout details are ready",
      errors: {},
    });
  });
});
