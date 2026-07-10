export const adminSessionCookieName = "admin_session";
export const adminSessionMaxAgeSeconds = 60 * 60 * 8;

type AdminAuthEnvironment = Readonly<Record<string, string | undefined>> &
  Readonly<{
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    ADMIN_SESSION_SECRET?: string;
  }>;

type AdminAuthConfig =
  | Readonly<{
      configured: true;
      email: string;
      password: string;
      sessionSecret: string;
      missing: [];
    }>
  | Readonly<{
      configured: false;
      missing: string[];
    }>;

type AdminSessionPayload = Readonly<{
  email: string;
  expiresAt: number;
}>;

export type AdminSessionCookieOptions = Readonly<{
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/admin";
  maxAge: number;
}>;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function constantTimeEqual(left: string, right: string) {
  const leftBytes = textEncoder.encode(left);
  const rightBytes = textEncoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlEncodeText(value: string) {
  return base64UrlEncodeBytes(textEncoder.encode(value));
}

function base64UrlDecodeText(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(paddedBase64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return textDecoder.decode(bytes);
}

async function signSessionPayload(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload));

  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function parseSessionPayload(encodedPayload: string): AdminSessionPayload | null {
  try {
    const payload = JSON.parse(base64UrlDecodeText(encodedPayload)) as Partial<AdminSessionPayload>;

    if (typeof payload.email !== "string" || typeof payload.expiresAt !== "number") {
      return null;
    }

    return {
      email: payload.email,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

export function getAdminAuthConfig(env: AdminAuthEnvironment = process.env): AdminAuthConfig {
  const email = env.ADMIN_EMAIL?.trim();
  const password = env.ADMIN_PASSWORD;
  const sessionSecret = env.ADMIN_SESSION_SECRET;
  const missing: string[] = [];

  if (!email) {
    missing.push("ADMIN_EMAIL");
  }

  if (!password) {
    missing.push("ADMIN_PASSWORD");
  }

  if (!sessionSecret) {
    missing.push("ADMIN_SESSION_SECRET");
  }

  if (missing.length > 0) {
    return {
      configured: false,
      missing,
    };
  }

  if (!email || !password || !sessionSecret) {
    return {
      configured: false,
      missing: ["ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"],
    };
  }

  return {
    configured: true,
    email,
    password,
    sessionSecret,
    missing: [],
  };
}

export function getAdminSessionCookieOptions(): AdminSessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: adminSessionMaxAgeSeconds,
  };
}

export function getExpiredAdminSessionCookieOptions(): AdminSessionCookieOptions {
  return {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  };
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
  env: AdminAuthEnvironment = process.env,
) {
  const config = getAdminAuthConfig(env);

  if (!config.configured) {
    return false;
  }

  return (
    constantTimeEqual(normalizeEmail(email), normalizeEmail(config.email)) &&
    constantTimeEqual(password, config.password)
  );
}

export async function createAdminSessionToken(
  email: string,
  env: AdminAuthEnvironment = process.env,
  now = Date.now(),
) {
  const config = getAdminAuthConfig(env);

  if (!config.configured) {
    throw new Error(`admin auth is not configured: ${config.missing.join(", ")}`);
  }

  const encodedPayload = base64UrlEncodeText(
    JSON.stringify({
      email: normalizeEmail(email),
      expiresAt: now + adminSessionMaxAgeSeconds * 1000,
    } satisfies AdminSessionPayload),
  );
  const signature = await signSessionPayload(encodedPayload, config.sessionSecret);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined,
  env: AdminAuthEnvironment = process.env,
  now = Date.now(),
) {
  const config = getAdminAuthConfig(env);

  if (!token || !config.configured) {
    return null;
  }

  const tokenParts = token.split(".");

  if (tokenParts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = tokenParts;

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await signSessionPayload(encodedPayload, config.sessionSecret);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  const payload = parseSessionPayload(encodedPayload);

  if (!payload || payload.expiresAt <= now) {
    return null;
  }

  if (!constantTimeEqual(normalizeEmail(payload.email), normalizeEmail(config.email))) {
    return null;
  }

  return payload.email;
}
