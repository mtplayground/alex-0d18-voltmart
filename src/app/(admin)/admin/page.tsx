export const metadata = {
  title: "Admin",
};

export default function AdminHomePage() {
  return (
    <div className="page-frame">
      <section className="section-panel" aria-labelledby="admin-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-title" className="page-title">
          Admin route group
        </h1>
        <p className="page-copy">
          The admin area is scaffolded for future authentication, product management, and order
          review issues.
        </p>
      </section>
    </div>
  );
}
