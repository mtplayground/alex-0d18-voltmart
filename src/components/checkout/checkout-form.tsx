"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { validateCheckoutDetails } from "@/app/(storefront)/checkout/actions";
import {
  initialCheckoutFormState,
  type CheckoutFieldName,
  type CheckoutFieldErrors,
} from "@/lib/checkout-validation";

type CheckoutFormProps = Readonly<{
  disabled: boolean;
}>;

type FieldConfig = Readonly<{
  name: CheckoutFieldName;
  label: string;
  autoComplete: string;
  required?: boolean;
  type?: string;
  inputMode?: "email" | "numeric" | "search" | "tel" | "text" | "url";
  maxLength?: number;
  pattern?: string;
}>;

const contactFields: FieldConfig[] = [
  {
    name: "customerName",
    label: "Full name",
    autoComplete: "name",
    required: true,
    maxLength: 120,
  },
  {
    name: "customerEmail",
    label: "Email",
    autoComplete: "email",
    required: true,
    type: "email",
    inputMode: "email",
    maxLength: 160,
  },
  {
    name: "customerPhone",
    label: "Phone",
    autoComplete: "tel",
    type: "tel",
    inputMode: "tel",
    maxLength: 30,
    pattern: "[0-9()+\\-\\s.]{7,30}",
  },
];

const shippingFields: FieldConfig[] = [
  {
    name: "shippingName",
    label: "Recipient name",
    autoComplete: "shipping name",
    required: true,
    maxLength: 120,
  },
  {
    name: "shippingAddressLine1",
    label: "Address line 1",
    autoComplete: "shipping address-line1",
    required: true,
    maxLength: 160,
  },
  {
    name: "shippingAddressLine2",
    label: "Address line 2",
    autoComplete: "shipping address-line2",
    maxLength: 160,
  },
  {
    name: "shippingCity",
    label: "City",
    autoComplete: "shipping address-level2",
    required: true,
    maxLength: 80,
  },
  {
    name: "shippingRegion",
    label: "State or region",
    autoComplete: "shipping address-level1",
    required: true,
    maxLength: 80,
  },
  {
    name: "shippingPostalCode",
    label: "Postal code",
    autoComplete: "shipping postal-code",
    required: true,
    maxLength: 20,
    pattern: "[A-Za-z0-9][A-Za-z0-9\\-\\s]{1,19}",
  },
  {
    name: "shippingCountry",
    label: "Country",
    autoComplete: "shipping country-name",
    required: true,
    maxLength: 80,
  },
];

function SubmitButton({ disabled }: CheckoutFormProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="min-h-12 w-full rounded-card bg-electric px-5 text-base font-black text-white shadow-glow transition hover:bg-violet disabled:cursor-not-allowed disabled:bg-muted disabled:shadow-none"
    >
      {pending ? "Checking details" : "Review details"}
    </button>
  );
}

function Field({
  config,
  errors,
  value,
  disabled,
}: Readonly<{
  config: FieldConfig;
  errors: CheckoutFieldErrors;
  value: string;
  disabled: boolean;
}>) {
  const error = errors[config.name];
  const inputId = `checkout-${config.name}`;
  const errorId = `${inputId}-error`;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="text-sm font-black text-ink">{config.label}</span>
      <input
        id={inputId}
        name={config.name}
        type={config.type ?? "text"}
        defaultValue={value}
        disabled={disabled}
        required={config.required}
        autoComplete={config.autoComplete}
        inputMode={config.inputMode}
        maxLength={config.maxLength}
        pattern={config.pattern}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className="mt-2 min-h-12 w-full rounded-card border border-border bg-panel-strong px-4 text-base text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/15 disabled:cursor-not-allowed disabled:bg-border/40"
      />
      {error ? (
        <span id={errorId} className="mt-2 block text-sm font-semibold text-coral">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Fieldset({
  title,
  fields,
  errors,
  values,
  disabled,
}: Readonly<{
  title: string;
  fields: FieldConfig[];
  errors: CheckoutFieldErrors;
  values: Record<CheckoutFieldName, string>;
  disabled: boolean;
}>) {
  return (
    <fieldset className="rounded-card border border-border bg-panel-strong p-5 shadow-soft">
      <legend className="px-1 text-xl font-black text-ink">{title}</legend>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.name}
            config={field}
            errors={errors}
            value={values[field.name]}
            disabled={disabled}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function CheckoutForm({ disabled }: CheckoutFormProps) {
  const [state, formAction] = useActionState(validateCheckoutDetails, initialCheckoutFormState);

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-card border border-mint/30 bg-mint/10 px-4 py-3 text-sm font-bold text-ink"
              : "rounded-card border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-ink"
          }
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}
      <Fieldset
        title="Contact"
        fields={contactFields}
        errors={state.errors}
        values={state.values}
        disabled={disabled}
      />
      <Fieldset
        title="Shipping"
        fields={shippingFields}
        errors={state.errors}
        values={state.values}
        disabled={disabled}
      />
      <SubmitButton disabled={disabled} />
    </form>
  );
}
