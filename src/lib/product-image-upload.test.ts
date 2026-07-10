import { describe, expect, it, vi } from "vitest";

import { maxProductImageBytes, uploadProductImageFromFormData } from "@/lib/product-image-upload";

function createImageFormData(file?: File) {
  const formData = new FormData();

  if (file) {
    formData.set("imageUpload", file);
  }

  return formData;
}

describe("product image upload", () => {
  it("skips empty image fields", async () => {
    const uploadObject = vi.fn();

    await expect(
      uploadProductImageFromFormData(createImageFormData(), uploadObject),
    ).resolves.toEqual({
      status: "empty",
    });
    expect(uploadObject).not.toHaveBeenCalled();
  });

  it("rejects unsupported image types", async () => {
    const uploadObject = vi.fn();
    const file = new File(["not image"], "notes.txt", { type: "text/plain" });

    await expect(
      uploadProductImageFromFormData(createImageFormData(file), uploadObject),
    ).resolves.toEqual({
      status: "error",
      message: "Upload a JPG, PNG, WebP, or GIF image",
    });
    expect(uploadObject).not.toHaveBeenCalled();
  });

  it("rejects oversized image files", async () => {
    const uploadObject = vi.fn();
    const file = new File([new Uint8Array(maxProductImageBytes + 1)], "phone.png", {
      type: "image/png",
    });

    await expect(
      uploadProductImageFromFormData(createImageFormData(file), uploadObject),
    ).resolves.toEqual({
      status: "error",
      message: "Image must be 5 MB or smaller",
    });
    expect(uploadObject).not.toHaveBeenCalled();
  });

  it("uploads supported images under the products prefix folder", async () => {
    const uploadObject = vi.fn().mockResolvedValue("products/uploaded.jpg");
    const file = new File([new Uint8Array([1, 2, 3])], "phone.jpg", { type: "image/jpeg" });
    const result = await uploadProductImageFromFormData(createImageFormData(file), uploadObject);

    expect(result).toMatchObject({
      status: "uploaded",
    });
    expect(result.status === "uploaded" ? result.imageKey : "").toMatch(
      /^products\/[0-9a-f-]+\.jpg$/,
    );
    expect(uploadObject).toHaveBeenCalledWith(
      expect.objectContaining({
        relativeKey: expect.stringMatching(/^products\/[0-9a-f-]+\.jpg$/),
        body: new Uint8Array([1, 2, 3]),
        contentType: "image/jpeg",
      }),
    );
  });

  it("maps storage failures to a form-safe upload error", async () => {
    const uploadObject = vi.fn().mockRejectedValue(new Error("storage unavailable"));
    const file = new File([new Uint8Array([1, 2, 3])], "phone.webp", { type: "image/webp" });

    await expect(
      uploadProductImageFromFormData(createImageFormData(file), uploadObject),
    ).resolves.toEqual({
      status: "error",
      message: "Image upload failed",
    });
  });
});
