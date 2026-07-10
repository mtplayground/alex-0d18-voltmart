import { cookies } from "next/headers";

export const cartSessionCookieName = "voltmart_cart_session";
export const cartSessionMaxAgeSeconds = 60 * 60 * 24 * 90;

const cartSessionIdPattern = /^[A-Za-z0-9_-]{20,128}$/;

export type CartSessionCookieOptions = Readonly<{
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
}>;

export type CartCookieStore = {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: CartSessionCookieOptions): void;
};

export function createCartSessionId() {
  return crypto.randomUUID();
}

export function isValidCartSessionId(sessionId: string | undefined): sessionId is string {
  return Boolean(sessionId && cartSessionIdPattern.test(sessionId));
}

export function getCartSessionCookieOptions(): CartSessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cartSessionMaxAgeSeconds,
  };
}

export function readCartSessionIdFromStore(cookieStore: Pick<CartCookieStore, "get">) {
  const existingSessionId = cookieStore.get(cartSessionCookieName)?.value;

  return isValidCartSessionId(existingSessionId) ? existingSessionId : null;
}

export function ensureCartSessionIdInStore(cookieStore: CartCookieStore) {
  const existingSessionId = readCartSessionIdFromStore(cookieStore);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId = createCartSessionId();
  cookieStore.set(cartSessionCookieName, sessionId, getCartSessionCookieOptions());

  return sessionId;
}

export async function getCartSessionId() {
  return readCartSessionIdFromStore(await cookies());
}

export async function getOrCreateCartSessionId() {
  return ensureCartSessionIdInStore(await cookies());
}
