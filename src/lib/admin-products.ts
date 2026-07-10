import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  uploadProductImageFromFormData,
  type ProductImageUploader,
} from "@/lib/product-image-upload";

export type AdminProductClient = Pick<PrismaClient, "category" | "product">;

const adminProductWithCategory = {
  category: true,
} satisfies Prisma.ProductInclude;

export type AdminProductWithCategory = Prisma.ProductGetPayload<{
  include: typeof adminProductWithCategory;
}>;

export const productFormFieldNames = [
  "categoryId",
  "name",
  "slug",
  "description",
  "price",
  "imageKeys",
  "imageUpload",
  "inStock",
  "isActive",
] as const;

export type ProductFormFieldName = (typeof productFormFieldNames)[number];

export type ProductFormValues = Record<ProductFormFieldName, string>;

export type ProductFormErrors = Partial<Record<ProductFormFieldName, string>>;

export type ProductFormState = Readonly<{
  status: "idle" | "error" | "success";
  message?: string;
  values: ProductFormValues;
  errors: ProductFormErrors;
}>;

export const emptyProductFormValues: ProductFormValues = {
  categoryId: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  imageKeys: "",
  imageUpload: "",
  inStock: "on",
  isActive: "on",
};

export const initialProductFormState: ProductFormState = {
  status: "idle",
  values: emptyProductFormValues,
  errors: {},
};

function readString(formData: FormData, fieldName: ProductFormFieldName) {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseImageKeys(value: string) {
  return value
    .split(/[\n,]/)
    .map((imageKey) => imageKey.trim())
    .filter(Boolean);
}

export function formatPriceInput(priceCents: number) {
  return (priceCents / 100).toFixed(2);
}

function parsePriceCents(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return null;
  }

  const [dollars, cents = ""] = value.split(".");
  const priceCents = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));

  return Number.isSafeInteger(priceCents) ? priceCents : null;
}

function fail(
  message: string,
  values: ProductFormValues,
  errors: ProductFormErrors = {},
): ProductFormState {
  return {
    status: "error",
    message,
    values,
    errors,
  };
}

function success(message: string, values: ProductFormValues): ProductFormState {
  return {
    status: "success",
    message,
    values,
    errors: {},
  };
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

export function valuesFromProductFormData(formData: FormData): ProductFormValues {
  const name = readString(formData, "name");
  const slug = readString(formData, "slug") || slugify(name);

  return {
    categoryId: readString(formData, "categoryId"),
    name,
    slug,
    description: readString(formData, "description"),
    price: readString(formData, "price"),
    imageKeys: readString(formData, "imageKeys"),
    imageUpload: "",
    inStock: formData.get("inStock") === "on" ? "on" : "",
    isActive: formData.get("isActive") === "on" ? "on" : "",
  };
}

export function valuesFromProduct(product: AdminProductWithCategory): ProductFormValues {
  return {
    categoryId: product.categoryId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: formatPriceInput(product.priceCents),
    imageKeys: product.imageKeys.join("\n"),
    imageUpload: "",
    inStock: product.inStock ? "on" : "",
    isActive: product.isActive ? "on" : "",
  };
}

function valuesWithUploadedImage(values: ProductFormValues, imageKey: string) {
  return {
    ...values,
    imageKeys: [...parseImageKeys(values.imageKeys), imageKey].join("\n"),
  };
}

function validateProductValues(values: ProductFormValues) {
  const errors: ProductFormErrors = {};
  const priceCents = parsePriceCents(values.price);

  if (!values.categoryId) {
    errors.categoryId = "Category is required";
  }

  if (values.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (values.name.length > 160) {
    errors.name = "Name must be 160 characters or fewer";
  }

  if (!values.slug) {
    errors.slug = "Slug is required";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    errors.slug = "Use lowercase letters, numbers, and hyphens";
  } else if (values.slug.length > 180) {
    errors.slug = "Slug must be 180 characters or fewer";
  }

  if (values.description.length < 10) {
    errors.description = "Description must be at least 10 characters";
  } else if (values.description.length > 2000) {
    errors.description = "Description must be 2000 characters or fewer";
  }

  if (priceCents === null || priceCents <= 0) {
    errors.price = "Enter a price greater than 0 with up to 2 decimals";
  }

  if (parseImageKeys(values.imageKeys).some((imageKey) => imageKey.length > 240)) {
    errors.imageKeys = "Image keys must be 240 characters or fewer";
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
    priceCents,
  };
}

function productDataFromValues(values: ProductFormValues, priceCents: number) {
  return {
    categoryId: values.categoryId,
    name: values.name,
    slug: values.slug,
    description: values.description,
    priceCents,
    imageKeys: parseImageKeys(values.imageKeys),
    inStock: values.inStock === "on",
    isActive: values.isActive === "on",
  } satisfies Prisma.ProductUncheckedCreateInput;
}

export async function listAdminProducts(client: AdminProductClient = prisma) {
  return client.product.findMany({
    include: adminProductWithCategory,
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });
}

export async function getAdminProductById(productId: string, client: AdminProductClient = prisma) {
  const normalizedProductId = productId.trim();

  if (!normalizedProductId) {
    return null;
  }

  return client.product.findUnique({
    where: {
      id: normalizedProductId,
    },
    include: adminProductWithCategory,
  });
}

export async function listAdminProductCategories(client: AdminProductClient = prisma) {
  return client.category.findMany({
    orderBy: [{ name: "asc" }],
  });
}

export async function createAdminProduct(
  formData: FormData,
  client: AdminProductClient = prisma,
  uploadImage: ProductImageUploader = uploadProductImageFromFormData,
): Promise<ProductFormState> {
  const values = valuesFromProductFormData(formData);
  const validation = validateProductValues(values);

  if (!validation.success || validation.priceCents === null) {
    return fail("Review the highlighted fields", values, validation.errors);
  }

  const uploadResult = await uploadImage(formData);
  const productValues =
    uploadResult.status === "uploaded"
      ? valuesWithUploadedImage(values, uploadResult.imageKey)
      : values;

  if (uploadResult.status === "error") {
    return fail("Review the highlighted fields", values, {
      imageUpload: uploadResult.message,
    });
  }

  try {
    await client.product.create({
      data: productDataFromValues(productValues, validation.priceCents),
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fail("Product slug already exists", productValues, {
        slug: "Slug must be unique",
      });
    }

    throw error;
  }

  return success("Product created", productValues);
}

export async function updateAdminProduct(
  productId: string,
  formData: FormData,
  client: AdminProductClient = prisma,
  uploadImage: ProductImageUploader = uploadProductImageFromFormData,
): Promise<ProductFormState> {
  const values = valuesFromProductFormData(formData);
  const validation = validateProductValues(values);

  if (!validation.success || validation.priceCents === null) {
    return fail("Review the highlighted fields", values, validation.errors);
  }

  const uploadResult = await uploadImage(formData);
  const productValues =
    uploadResult.status === "uploaded"
      ? valuesWithUploadedImage(values, uploadResult.imageKey)
      : values;

  if (uploadResult.status === "error") {
    return fail("Review the highlighted fields", values, {
      imageUpload: uploadResult.message,
    });
  }

  try {
    await client.product.update({
      where: {
        id: productId,
      },
      data: productDataFromValues(productValues, validation.priceCents),
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return fail("Product slug already exists", productValues, {
        slug: "Slug must be unique",
      });
    }

    throw error;
  }

  return success("Product updated", productValues);
}

export async function deleteAdminProduct(productId: string, client: AdminProductClient = prisma) {
  await client.product.update({
    where: {
      id: productId,
    },
    data: {
      isActive: false,
    },
  });
}
