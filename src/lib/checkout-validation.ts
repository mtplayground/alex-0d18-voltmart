export const checkoutFieldNames = [
  "customerName",
  "customerEmail",
  "customerPhone",
  "shippingName",
  "shippingAddressLine1",
  "shippingAddressLine2",
  "shippingCity",
  "shippingRegion",
  "shippingPostalCode",
  "shippingCountry",
] as const;

export type CheckoutFieldName = (typeof checkoutFieldNames)[number];

export type CheckoutFormValues = Record<CheckoutFieldName, string>;

export type CheckoutFieldErrors = Partial<Record<CheckoutFieldName, string>>;

export type CheckoutFormState = Readonly<{
  status: "idle" | "error" | "success";
  message?: string;
  values: CheckoutFormValues;
  errors: CheckoutFieldErrors;
}>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9()+\-\s.]{7,30}$/;
const postalCodePattern = /^[A-Za-z0-9][A-Za-z0-9\-\s]{1,19}$/;

export const emptyCheckoutFormValues: CheckoutFormValues = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  shippingName: "",
  shippingAddressLine1: "",
  shippingAddressLine2: "",
  shippingCity: "",
  shippingRegion: "",
  shippingPostalCode: "",
  shippingCountry: "United States",
};

export const initialCheckoutFormState: CheckoutFormState = {
  status: "idle",
  values: emptyCheckoutFormValues,
  errors: {},
};

function readString(formData: FormData, fieldName: CheckoutFieldName) {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value.trim() : "";
}

function requireLength(
  values: CheckoutFormValues,
  errors: CheckoutFieldErrors,
  fieldName: CheckoutFieldName,
  label: string,
  minLength: number,
  maxLength: number,
) {
  const value = values[fieldName];

  if (!value) {
    errors[fieldName] = `${label} is required`;
  } else if (value.length < minLength) {
    errors[fieldName] = `${label} must be at least ${minLength} characters`;
  } else if (value.length > maxLength) {
    errors[fieldName] = `${label} must be ${maxLength} characters or fewer`;
  }
}

export function valuesFromCheckoutFormData(formData: FormData): CheckoutFormValues {
  return checkoutFieldNames.reduce<CheckoutFormValues>(
    (values, fieldName) => ({
      ...values,
      [fieldName]: readString(formData, fieldName),
    }),
    { ...emptyCheckoutFormValues },
  );
}

export function validateCheckoutValues(values: CheckoutFormValues) {
  const errors: CheckoutFieldErrors = {};

  requireLength(values, errors, "customerName", "Name", 2, 120);
  requireLength(values, errors, "shippingName", "Shipping name", 2, 120);
  requireLength(values, errors, "shippingAddressLine1", "Address line 1", 5, 160);
  requireLength(values, errors, "shippingCity", "City", 2, 80);
  requireLength(values, errors, "shippingRegion", "State or region", 2, 80);
  requireLength(values, errors, "shippingPostalCode", "Postal code", 2, 20);
  requireLength(values, errors, "shippingCountry", "Country", 2, 80);

  if (!values.customerEmail) {
    errors.customerEmail = "Email is required";
  } else if (!emailPattern.test(values.customerEmail)) {
    errors.customerEmail = "Enter a valid email address";
  } else if (values.customerEmail.length > 160) {
    errors.customerEmail = "Email must be 160 characters or fewer";
  }

  if (values.customerPhone && !phonePattern.test(values.customerPhone)) {
    errors.customerPhone = "Enter a valid phone number";
  }

  if (values.shippingAddressLine2.length > 160) {
    errors.shippingAddressLine2 = "Address line 2 must be 160 characters or fewer";
  }

  if (values.shippingPostalCode && !postalCodePattern.test(values.shippingPostalCode)) {
    errors.shippingPostalCode = "Enter a valid postal code";
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCheckoutFormData(formData: FormData): CheckoutFormState {
  const values = valuesFromCheckoutFormData(formData);
  const validation = validateCheckoutValues(values);

  if (!validation.success) {
    return {
      status: "error",
      message: "Review the highlighted fields",
      values,
      errors: validation.errors,
    };
  }

  return {
    status: "success",
    message: "Checkout details are ready",
    values,
    errors: {},
  };
}
