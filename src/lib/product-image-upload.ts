import { randomUUID } from "node:crypto";

import { putObjectBuffer } from "@/lib/object-storage";

export const maxProductImageBytes = 5 * 1024 * 1024;

const imageExtensionsByMimeType = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type ProductImageUploadResult =
  | Readonly<{ status: "empty" }>
  | Readonly<{ status: "uploaded"; imageKey: string }>
  | Readonly<{ status: "error"; message: string }>;

export type ProductImageUploader = typeof uploadProductImageFromFormData;

type ObjectUploader = typeof putObjectBuffer;

function isSupportedImageType(contentType: string): contentType is keyof typeof imageExtensionsByMimeType {
  return contentType in imageExtensionsByMimeType;
}

export async function uploadProductImageFromFormData(
  formData: FormData,
  uploadObject: ObjectUploader = putObjectBuffer,
): Promise<ProductImageUploadResult> {
  const imageFile = formData.get("imageUpload");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return { status: "empty" };
  }

  if (!isSupportedImageType(imageFile.type)) {
    return { status: "error", message: "Upload a JPG, PNG, WebP, or GIF image" };
  }

  if (imageFile.size > maxProductImageBytes) {
    return { status: "error", message: "Image must be 5 MB or smaller" };
  }

  const imageBytes = new Uint8Array(await imageFile.arrayBuffer());
  const imageKey = `products/${randomUUID()}.${imageExtensionsByMimeType[imageFile.type]}`;

  try {
    await uploadObject({
      relativeKey: imageKey,
      body: imageBytes,
      contentType: imageFile.type,
    });
  } catch (error) {
    console.error("Product image upload failed", error);
    return { status: "error", message: "Image upload failed" };
  }

  return {
    status: "uploaded",
    imageKey,
  };
}
