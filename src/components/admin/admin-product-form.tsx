"use client";

import type { Category } from "@prisma/client";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { ProductFormState } from "@/lib/admin-products";

type ProductFormAction = (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;

type AdminProductFormProps = Readonly<{
  action: ProductFormAction;
  categories: Category[];
  initialState: ProductFormState;
  submitLabel: string;
}>;

function SubmitButton({ label }: Readonly<{ label: string }>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 items-center justify-center rounded-card bg-electric px-5 text-base font-black text-white shadow-glow transition hover:bg-violet disabled:cursor-not-allowed disabled:bg-muted disabled:shadow-none"
    >
      {pending ? "Saving" : label}
    </button>
  );
}

export function AdminProductForm({
  action,
  categories,
  initialState,
  submitLabel,
}: AdminProductFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const values = state.values;

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-5">
      {state.message && state.status === "error" ? (
        <p
          className="rounded-card border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-ink"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-5 rounded-card border border-border bg-panel-strong p-5 shadow-soft md:grid-cols-2">
        <label className="block" htmlFor="product-name">
          <span className="text-sm font-black text-ink">Name</span>
          <input
            id="product-name"
            name="name"
            defaultValue={values.name}
            required
            maxLength={160}
            className="mt-2 min-h-12 w-full rounded-card border border-border bg-panel px-4 text-base text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/15"
          />
          {state.errors.name ? (
            <span className="mt-2 block text-sm font-semibold text-coral">{state.errors.name}</span>
          ) : null}
        </label>

        <label className="block" htmlFor="product-slug">
          <span className="text-sm font-black text-ink">Slug</span>
          <input
            id="product-slug"
            name="slug"
            defaultValue={values.slug}
            maxLength={180}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            className="mt-2 min-h-12 w-full rounded-card border border-border bg-panel px-4 text-base text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/15"
          />
          {state.errors.slug ? (
            <span className="mt-2 block text-sm font-semibold text-coral">{state.errors.slug}</span>
          ) : null}
        </label>

        <label className="block" htmlFor="product-category">
          <span className="text-sm font-black text-ink">Category</span>
          <select
            id="product-category"
            name="categoryId"
            defaultValue={values.categoryId}
            required
            className="mt-2 min-h-12 w-full rounded-card border border-border bg-panel px-4 text-base text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/15"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {state.errors.categoryId ? (
            <span className="mt-2 block text-sm font-semibold text-coral">
              {state.errors.categoryId}
            </span>
          ) : null}
        </label>

        <label className="block" htmlFor="product-price">
          <span className="text-sm font-black text-ink">Price</span>
          <input
            id="product-price"
            name="price"
            type="text"
            inputMode="decimal"
            defaultValue={values.price}
            placeholder="99.99"
            required
            className="mt-2 min-h-12 w-full rounded-card border border-border bg-panel px-4 text-base text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/15"
          />
          {state.errors.price ? (
            <span className="mt-2 block text-sm font-semibold text-coral">
              {state.errors.price}
            </span>
          ) : null}
        </label>

        <label className="block md:col-span-2" htmlFor="product-description">
          <span className="text-sm font-black text-ink">Description</span>
          <textarea
            id="product-description"
            name="description"
            defaultValue={values.description}
            required
            rows={5}
            maxLength={2000}
            className="mt-2 w-full rounded-card border border-border bg-panel px-4 py-3 text-base text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/15"
          />
          {state.errors.description ? (
            <span className="mt-2 block text-sm font-semibold text-coral">
              {state.errors.description}
            </span>
          ) : null}
        </label>

        <label className="block md:col-span-2" htmlFor="product-image-keys">
          <span className="text-sm font-black text-ink">Image keys</span>
          <textarea
            id="product-image-keys"
            name="imageKeys"
            defaultValue={values.imageKeys}
            rows={4}
            className="mt-2 w-full rounded-card border border-border bg-panel px-4 py-3 text-base text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/15"
          />
          {state.errors.imageKeys ? (
            <span className="mt-2 block text-sm font-semibold text-coral">
              {state.errors.imageKeys}
            </span>
          ) : null}
        </label>

        <label className="block md:col-span-2" htmlFor="product-image-upload">
          <span className="text-sm font-black text-ink">Upload image</span>
          <input
            id="product-image-upload"
            name="imageUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-2 block w-full rounded-card border border-border bg-panel px-4 py-3 text-base text-ink file:mr-4 file:rounded-card file:border-0 file:bg-electric file:px-4 file:py-2 file:text-sm file:font-black file:text-white focus:border-electric focus:outline-none focus:ring-4 focus:ring-electric/15"
          />
          {state.errors.imageUpload ? (
            <span className="mt-2 block text-sm font-semibold text-coral">
              {state.errors.imageUpload}
            </span>
          ) : null}
        </label>

        <label className="flex items-center gap-3 rounded-card border border-border bg-panel p-4">
          <input
            name="inStock"
            type="checkbox"
            defaultChecked={values.inStock === "on"}
            className="h-5 w-5 accent-electric"
          />
          <span className="text-sm font-black text-ink">In stock</span>
        </label>

        <label className="flex items-center gap-3 rounded-card border border-border bg-panel p-4">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={values.isActive === "on"}
            className="h-5 w-5 accent-electric"
          />
          <span className="text-sm font-black text-ink">Active in catalog</span>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href="/admin/products"
          className="inline-flex min-h-12 items-center justify-center rounded-card border border-border bg-panel-strong px-5 text-base font-black text-ink transition hover:border-electric/40 hover:text-electric"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
