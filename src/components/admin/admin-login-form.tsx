"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAdmin, type AdminLoginState } from "@/app/(admin)/admin/login/actions";

type AdminLoginFormProps = Readonly<{
  disabled: boolean;
  missingConfig: string[];
  nextPath: string;
}>;

function SubmitButton({ disabled }: Readonly<{ disabled: boolean }>) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="min-h-12 w-full rounded-card bg-electric px-5 text-base font-black text-white shadow-glow transition hover:bg-violet disabled:cursor-not-allowed disabled:bg-muted disabled:shadow-none"
    >
      {pending ? "Signing in" : "Sign in"}
    </button>
  );
}

export function AdminLoginForm({ disabled, missingConfig, nextPath }: AdminLoginFormProps) {
  const initialState: AdminLoginState = {
    status: "idle",
    email: "",
    nextPath,
  };
  const [state, formAction] = useActionState(loginAdmin, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {missingConfig.length > 0 ? (
        <p
          className="rounded-card border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-ink"
          role="alert"
        >
          Admin auth is missing {missingConfig.join(", ")}
        </p>
      ) : null}
      {state.message ? (
        <p
          className="rounded-card border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-bold text-ink"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <input type="hidden" name="nextPath" value={state.nextPath} />

      <label className="block" htmlFor="admin-email">
        <span className="text-sm font-black text-ink">Email</span>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          disabled={disabled}
          required
          className="mt-2 min-h-12 w-full rounded-card border border-border bg-panel px-4 text-base text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/15 disabled:cursor-not-allowed disabled:bg-border/40"
        />
      </label>

      <label className="block" htmlFor="admin-password">
        <span className="text-sm font-black text-ink">Password</span>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          disabled={disabled}
          required
          className="mt-2 min-h-12 w-full rounded-card border border-border bg-panel px-4 text-base text-ink outline-none transition focus:border-electric focus:ring-4 focus:ring-electric/15 disabled:cursor-not-allowed disabled:bg-border/40"
        />
      </label>

      <SubmitButton disabled={disabled} />
    </form>
  );
}
