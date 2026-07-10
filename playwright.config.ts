import { existsSync, readFileSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 8080);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

function readEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) {
          return null;
        }

        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();
        const value =
          (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
          (rawValue.startsWith("'") && rawValue.endsWith("'"))
            ? rawValue.slice(1, -1)
            : rawValue;

        return [key, value] as const;
      })
      .filter((entry): entry is readonly [string, string] => Boolean(entry)),
  );
}

function readDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const workspaceDatabaseUrlPath = "/workspace/.database_url";
  if (existsSync(workspaceDatabaseUrlPath)) {
    return readFileSync(workspaceDatabaseUrlPath, "utf8").trim();
  }

  throw new Error("DATABASE_URL is required to run Playwright e2e tests");
}

const databaseUrl = readDatabaseUrl();
const productionEnv = readEnvFile("/workspace/.env.production");
const adminEmail = process.env.ADMIN_EMAIL ?? "e2e-admin@example.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "e2e-password";
const adminSessionSecret =
  process.env.ADMIN_SESSION_SECRET ?? "e2e-session-secret-e2e-session-secret";

const webServerEnv = {
  ...productionEnv,
  ...process.env,
  DATABASE_URL: databaseUrl,
  SELF_URL: process.env.SELF_URL ?? baseURL,
  ADMIN_EMAIL: adminEmail,
  ADMIN_PASSWORD: adminPassword,
  ADMIN_SESSION_SECRET: adminSessionSecret,
  MCTAI_EMAIL_URL: "",
  MCTAI_EMAIL_APP_TOKEN: "",
} as Record<string, string>;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: webServerEnv,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
