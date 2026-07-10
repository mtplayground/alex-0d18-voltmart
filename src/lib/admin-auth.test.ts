import { describe, expect, it } from "vitest";

import {
  adminSessionMaxAgeSeconds,
  createAdminSessionToken,
  getAdminAuthConfig,
  verifyAdminCredentials,
  verifyAdminSessionToken,
} from "@/lib/admin-auth";

const env = {
  ADMIN_EMAIL: "admin@example.com",
  ADMIN_PASSWORD: "correct-password",
  ADMIN_SESSION_SECRET: "test-session-secret-with-enough-entropy",
};

describe("admin auth", () => {
  it("reports missing admin credential environment variables", () => {
    expect(getAdminAuthConfig({ ADMIN_EMAIL: "admin@example.com" })).toEqual({
      configured: false,
      missing: ["ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"],
    });
  });

  it("verifies configured admin email and password", async () => {
    await expect(
      verifyAdminCredentials(" ADMIN@example.com ", "correct-password", env),
    ).resolves.toBe(true);
    await expect(verifyAdminCredentials("admin@example.com", "wrong-password", env)).resolves.toBe(
      false,
    );
    await expect(
      verifyAdminCredentials("other@example.com", "correct-password", env),
    ).resolves.toBe(false);
  });

  it("creates and verifies signed admin session tokens", async () => {
    const now = Date.UTC(2026, 6, 10, 12, 0, 0);
    const token = await createAdminSessionToken("admin@example.com", env, now);

    await expect(verifyAdminSessionToken(token, env, now + 1000)).resolves.toBe(
      "admin@example.com",
    );
  });

  it("rejects tampered and expired admin session tokens", async () => {
    const now = Date.UTC(2026, 6, 10, 12, 0, 0);
    const token = await createAdminSessionToken("admin@example.com", env, now);
    const tamperedToken = token.replace(/\.[^.]+$/, ".tampered");

    await expect(verifyAdminSessionToken(tamperedToken, env, now + 1000)).resolves.toBeNull();
    await expect(
      verifyAdminSessionToken(token, env, now + adminSessionMaxAgeSeconds * 1000 + 1),
    ).resolves.toBeNull();
  });
});
