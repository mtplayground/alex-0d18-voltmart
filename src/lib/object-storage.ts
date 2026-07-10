import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export type ObjectStorageConfig = Readonly<{
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  prefix: string;
  endpoint: string;
  region: string;
  forcePathStyle: boolean;
}>;

export type ObjectStorageEnv = Readonly<{
  [key: string]: string | undefined;
  OBJECT_STORAGE_ACCESS_KEY_ID?: string;
  OBJECT_STORAGE_SECRET_ACCESS_KEY?: string;
  OBJECT_STORAGE_BUCKET?: string;
  OBJECT_STORAGE_PREFIX?: string;
  OBJECT_STORAGE_ENDPOINT?: string;
  OBJECT_STORAGE_REGION?: string;
  OBJECT_STORAGE_FORCE_PATH_STYLE?: string;
}>;

type S3Sender = Readonly<{
  send(command: PutObjectCommand | GetObjectCommand): Promise<unknown>;
}>;

type GetSignedUrlFn = typeof getSignedUrl;

function readRequiredEnv(env: ObjectStorageEnv, name: keyof ObjectStorageEnv) {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`${name} env not set`);
  }

  return value;
}

export function getObjectStorageConfig(env: ObjectStorageEnv = process.env) {
  return {
    accessKeyId: readRequiredEnv(env, "OBJECT_STORAGE_ACCESS_KEY_ID"),
    secretAccessKey: readRequiredEnv(env, "OBJECT_STORAGE_SECRET_ACCESS_KEY"),
    bucket: readRequiredEnv(env, "OBJECT_STORAGE_BUCKET"),
    prefix: readRequiredEnv(env, "OBJECT_STORAGE_PREFIX"),
    endpoint: readRequiredEnv(env, "OBJECT_STORAGE_ENDPOINT"),
    region: readRequiredEnv(env, "OBJECT_STORAGE_REGION"),
    forcePathStyle:
      readRequiredEnv(env, "OBJECT_STORAGE_FORCE_PATH_STYLE").toLowerCase() === "true",
  } satisfies ObjectStorageConfig;
}

export function normalizeRelativeObjectKey(relativeKey: string) {
  const normalizedKey = relativeKey
    .trim()
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .join("/");

  if (!normalizedKey || normalizedKey.includes("..")) {
    throw new Error("Object key must be a relative path");
  }

  return normalizedKey;
}

export function objectKeyWithPrefix(relativeKey: string, config: ObjectStorageConfig) {
  return `${config.prefix}${normalizeRelativeObjectKey(relativeKey)}`;
}

export function createObjectStorageClient(config: ObjectStorageConfig) {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle,
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}

export async function putObjectBuffer(
  input: Readonly<{
    relativeKey: string;
    body: Uint8Array;
    contentType: string;
  }>,
  env: ObjectStorageEnv = process.env,
  client?: S3Sender,
) {
  const config = getObjectStorageConfig(env);
  const s3Client = client ?? createObjectStorageClient(config);
  const relativeKey = normalizeRelativeObjectKey(input.relativeKey);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: objectKeyWithPrefix(relativeKey, config),
      Body: input.body,
      ContentType: input.contentType,
      ContentLength: input.body.byteLength,
    }),
  );

  return relativeKey;
}

export async function getSignedObjectUrl(
  relativeKey: string,
  env: ObjectStorageEnv = process.env,
  client?: S3Client,
  signer: GetSignedUrlFn = getSignedUrl,
  expiresIn = 3600,
) {
  const config = getObjectStorageConfig(env);
  const s3Client = client ?? createObjectStorageClient(config);
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: objectKeyWithPrefix(relativeKey, config),
  });

  return signer(s3Client, command, { expiresIn });
}
