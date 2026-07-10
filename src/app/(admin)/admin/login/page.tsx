import type { Metadata } from "next";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminAuthConfig } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLoginPageProps = Readonly<{
  searchParams: Promise<{
    next?: string;
  }>;
}>;

function normalizeNextPath(nextPath: string | undefined) {
  if (
    nextPath &&
    nextPath.startsWith("/admin") &&
    !nextPath.startsWith("/admin/login") &&
    !nextPath.startsWith("//")
  ) {
    return nextPath;
  }

  return "/admin";
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { next } = await searchParams;
  const config = getAdminAuthConfig();

  return (
    <div className="page-frame">
      <section className="mx-auto max-w-xl" aria-labelledby="admin-login-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-login-title" className="page-title">
          Admin sign in
        </h1>
        <p className="page-copy">
          Use the configured admin email and password to access protected management pages.
        </p>
        <div className="mt-8 rounded-card border border-border bg-panel-strong p-5 shadow-soft">
          <AdminLoginForm
            disabled={!config.configured}
            missingConfig={config.configured ? [] : config.missing}
            nextPath={normalizeNextPath(next)}
          />
        </div>
      </section>
    </div>
  );
}
