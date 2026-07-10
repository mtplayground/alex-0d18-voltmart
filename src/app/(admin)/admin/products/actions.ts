"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProductById,
  updateAdminProduct,
  type ProductFormState,
} from "@/lib/admin-products";

function revalidateProductAdminPaths(productSlug?: string) {
  revalidatePath("/");
  revalidatePath("/admin/products");

  if (productSlug) {
    revalidatePath(`/products/${productSlug}`);
  }
}

export async function createProductAction(_previousState: ProductFormState, formData: FormData) {
  const state = await createAdminProduct(formData);

  if (state.status === "success") {
    revalidateProductAdminPaths(state.values.slug);
    redirect("/admin/products");
  }

  return state;
}

export async function updateProductAction(
  productId: string,
  _previousState: ProductFormState,
  formData: FormData,
) {
  const existingProduct = await getAdminProductById(productId);
  const state = await updateAdminProduct(productId, formData);

  if (state.status === "success") {
    if (existingProduct?.slug && existingProduct.slug !== state.values.slug) {
      revalidatePath(`/products/${existingProduct.slug}`);
    }

    revalidateProductAdminPaths(state.values.slug);
    redirect("/admin/products");
  }

  return state;
}

export async function deleteProductAction(productId: string) {
  await deleteAdminProduct(productId);
  revalidateProductAdminPaths();
  redirect("/admin/products");
}
