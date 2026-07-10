import type { ReactNode } from "react";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <main className="app-shell">{children}</main>;
}
