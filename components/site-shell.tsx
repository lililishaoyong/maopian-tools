import Link from "next/link";
import { Boxes, MessageCircle } from "lucide-react";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b border-stone-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link className="flex items-center gap-2" href="/">
            <span className="grid size-9 place-items-center rounded-lg bg-brand-500 text-white">
              <Boxes className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold text-stone-950">百宝箱</span>
              <span className="block text-xs text-stone-500">亲测好用的网站与工具</span>
            </span>
          </Link>
          <Link
            className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm"
            href="/contact"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            反馈
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
