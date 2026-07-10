export default function CatalogLoading() {
  return (
    <main className="app-shell">
      <div className="page-frame">
        <section aria-label="Loading catalog">
          <div className="h-4 w-28 animate-pulse rounded-full bg-electric/20" />
          <div className="mt-4 h-12 w-full max-w-xl animate-pulse rounded-card bg-ink/10" />
          <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded-full bg-muted/15" />
          <div className="mt-8 flex flex-wrap gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 w-28 animate-pulse rounded-full bg-panel-strong" />
            ))}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-card bg-panel-strong" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
