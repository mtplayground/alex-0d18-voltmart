import Link from "next/link";

export default function AdminNotFoundPage() {
  return (
    <div className="page-frame">
      <section className="surface-card-strong p-8 text-center">
        <p className="eyebrow">Admin 404</p>
        <h1 className="page-title">Admin item not found</h1>
        <p className="page-copy mx-auto mt-3 max-w-2xl">
          The order or product may have been removed, or the reference may have been entered
          incorrectly.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/admin/orders" className="primary-action px-5 text-base">
            Review orders
          </Link>
          <Link href="/admin/products" className="secondary-action px-5 text-base">
            Manage products
          </Link>
        </div>
      </section>
    </div>
  );
}
