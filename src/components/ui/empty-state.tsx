import type { ReactNode } from "react";

type EmptyStateProps = Readonly<{
  eyebrow?: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  live?: boolean;
}>;

export function EmptyState({
  eyebrow,
  title,
  children,
  action,
  className = "mt-8",
  live = false,
}: EmptyStateProps) {
  return (
    <section
      className={`surface-card p-8 text-center ${className}`}
      aria-live={live ? "polite" : undefined}
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="text-2xl font-black text-ink">{title}</h2>
      <div className="mx-auto mt-3 max-w-xl text-muted">{children}</div>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </section>
  );
}
