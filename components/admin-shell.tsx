import Link from "next/link";
import type { Route } from "next";
import { clsx } from "clsx";

type AdminSection = "resources" | "categories" | "content";

const nav = [
  { href: "/admin/resources", label: "资源维护", key: "resources" },
  { href: "/admin/categories", label: "分类维护", key: "categories" },
  { href: "/admin/content", label: "内容维护", key: "content" }
] as const;

export function AdminShell({
  active,
  children,
  title
}: {
  active: AdminSection;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-4 shadow-soft">
          <Link className="block px-2 text-lg font-semibold text-stone-950" href="/admin/resources">
            猫片后台
          </Link>
          <nav className="mt-6 space-y-1 text-sm">
            {nav.map((item) => (
              <Link
                className={clsx(
                  "block rounded-lg px-3 py-2",
                  active === item.key ? "bg-brand-50 text-brand-700" : "text-stone-600 hover:bg-stone-50"
                )}
                href={item.href as Route}
                key={item.key}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>
          <h1 className="text-2xl font-semibold text-stone-950">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminNotice({ error, ok }: { error?: string; ok?: string }) {
  if (!error && !ok) return null;
  return (
    <div className={clsx("mt-4 rounded-xl border px-4 py-3 text-sm", error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-brand-100 bg-brand-50 text-brand-700")}>
      {error || ok}
    </div>
  );
}
