import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { describe, expect, it, vi } from "vitest";

import {
  getObjectStorageConfig,
  getSignedObjectUrl,
  normalizeRelativeObjectKey,
  objectKeyWithPrefix,
  putObjectBuffer,
  type ObjectStorageEnv,
} from "@/lib/object-storage";

const storageEnv = {
  OBJECT_STORAGE_ACCESS_KEY_ID: "access-key",
  OBJECT_STORAGE_SECRET_ACCESS_KEY: "secret-key",
  OBJECT_STORAGE_BUCKET: "voltmart-products",
  OBJECT_STORAGE_PREFIX: "app_alex_0d18_voltmart_afc02b/",
  OBJECT_STORAGE_ENDPOINT: "https://fly.storage.tigris.dev",
  OBJECT_STORAGE_REGION: "auto",
  OBJECT_STORAGE_FORCE_PATH_STYLE: "true",
} satisfies ObjectStorageEnv;

describe("object storage helpers", () => {
  it("requires all provisioned object storage environment variables", () => {
    expect(() =>
      getObjectStorageConfig({
        ...storageEnv,
        OBJECT_STORAGE_PREFIX: "",
      }),
    ).toThrow("OBJECT_STORAGE_PREFIX env not set");
  });

  it("normalizes relative object keys and rejects unsafe paths", () => {
    expect(normalizeRelativeObjectKey("/products//phone.jpg")).toBe("products/phone.jpg");
    expect(() => normalizeRelativeObjectKey("../phone.jpg")).toThrow(
      "Object key must be a relative path",
    );
  });

  it("prepends the configured prefix to storage keys", () => {
    expect(objectKeyWithPrefix("products/phone.jpg", getObjectStorageConfig(storageEnv))).toBe(
      "app_alex_0d18_voltmart_afc02b/products/phone.jpg",
    );
  });

  it("uploads buffers with a prefixed key and concrete content length", async () => {
    const sender = {
      send: vi.fn().mockResolvedValue({}),
    };
    const body = new Uint8Array([1, 2, 3, 4]);

    await putObjectBuffer(
      {
        relativeKey: "products/phone.jpg",
        body,
        contentType: "image/jpeg",
      },
      storageEnv,
      sender,
    );

    const command = sender.send.mock.calls[0]?.[0] as PutObjectCommand;

    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: "voltmart-products",
      Key: "app_alex_0d18_voltmart_afc02b/products/phone.jpg",
      ContentType: "image/jpeg",
      ContentLength: body.byteLength,
    });
  });

  it("signs object reads with a prefixed key", async () => {
    const signer = vi.fn().mockResolvedValue("https://signed.example/products/phone.jpg");
    const url = await getSignedObjectUrl(
      "products/phone.jpg",
      storageEnv,
      undefined,
      signer,
      1800,
    );
    const command = signer.mock.calls[0]?.[1] as GetObjectCommand;

    expect(url).toBe("https://signed.example/products/phone.jpg");
    expect(command).toBeInstanceOf(GetObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: "voltmart-products",
      Key: "app_alex_0d18_voltmart_afc02b/products/phone.jpg",
    });
    expect(signer.mock.calls[0]?.[2]).toEqual({ expiresIn: 1800 });
  });
});
