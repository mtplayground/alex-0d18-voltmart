import Link from "next/link";

export default function StorefrontHomePage() {
  return (
    <main className="app-shell">
      <div className="page-frame">
        <section className="section-panel" aria-labelledby="storefront-title">
          <p className="eyebrow">Storefront</p>
          <h1 id="storefront-title" className="page-title">
            App Router foundation
          </h1>
          <p className="page-copy">
            The storefront route group is ready for catalog, product detail, cart, and checkout work
            in later issues.
          </p>
          <ul className="route-list" aria-label="Available route groups">
            <li className="route-card">
              <strong>Storefront routes</strong>
              <span>Public customer-facing pages render from the root route group.</span>
            </li>
            <li className="route-card">
              <strong>
                <Link href="/admin">Admin routes</Link>
              </strong>
              <span>Back-office pages live under the admin route group.</span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
