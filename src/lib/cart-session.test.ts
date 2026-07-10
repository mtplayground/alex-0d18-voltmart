import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  cartSessionCookieName,
  cartSessionMaxAgeSeconds,
  ensureCartSessionIdInStore,
  getCartSessionCookieOptions,
  isValidCartSessionId,
  readCartSessionIdFromStore,
  type CartCookieStore,
} from "@/lib/cart-session";

function createCookieStore(initialSessionId?: string) {
  const values = new Map<string, string>();

  if (initialSessionId) {
    values.set(cartSessionCookieName, initialSessionId);
  }

  return {
    get: vi.fn((name: string) => {
      const value = values.get(name);

      return value ? { value } : undefined;
    }),
    set: vi.fn((name: string, value: string) => {
      values.set(name, value);
    }),
  } satisfies CartCookieStore;
}

describe("cart session helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("recognizes generated session IDs and rejects blank values", () => {
    expect(isValidCartSessionId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isValidCartSessionId("")).toBe(false);
    expect(isValidCartSessionId(undefined)).toBe(false);
  });

  it("reads valid session IDs from cookies", () => {
    const cookieStore = createCookieStore("550e8400-e29b-41d4-a716-446655440000");

    expect(readCartSessionIdFromStore(cookieStore)).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("ignores malformed cookie values", () => {
    const cookieStore = createCookieStore("bad cookie value");

    expect(readCartSessionIdFromStore(cookieStore)).toBeNull();
  });

  it("reuses an existing cart session cookie", () => {
    const cookieStore = createCookieStore("550e8400-e29b-41d4-a716-446655440000");

    expect(ensureCartSessionIdInStore(cookieStore)).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(cookieStore.set).not.toHaveBeenCalled();
  });

  it("sets a durable http-only session cookie when one is missing", () => {
    const cookieStore = createCookieStore();
    const sessionId = ensureCartSessionIdInStore(cookieStore);

    expect(isValidCartSessionId(sessionId)).toBe(true);
    expect(cookieStore.set).toHaveBeenCalledWith(
      cartSessionCookieName,
      sessionId,
      getCartSessionCookieOptions(),
    );
  });

  it("uses secure cookies only in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(getCartSessionCookieOptions()).toEqual({
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: cartSessionMaxAgeSeconds,
    });
  });
});
