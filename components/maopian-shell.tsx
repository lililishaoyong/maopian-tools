import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Cat, Grid2X2, Heart, Home, PawPrint, UserRound } from "lucide-react";
import { clsx } from "clsx";
import type { SiteContent } from "@/lib/types";

type Tab = "home" | "categories" | "favorites" | "me";

export function MaopianShell({
  children,
  active = "home",
  content
}: {
  children: React.ReactNode;
  active?: Tab;
  content: SiteContent;
}) {
  return (
    <div className="min-h-screen text-cream-900">
      <main className="mx-auto min-h-screen max-w-[430px] bg-cream-50 px-4 pb-24 pt-4 shadow-card md:my-5 md:rounded-[28px]">
        {children}
      </main>
      <nav aria-label={`${content.brandName} 导航`} className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-cream-200 bg-white/95 px-3 py-2 shadow-[0_-12px_30px_rgba(120,76,45,0.08)] backdrop-blur md:bottom-5 md:rounded-b-[28px]">
        <div className="grid grid-cols-4 text-[11px]">
          <BottomLink href="/" label="首页" active={active === "home"} icon={<Home className="size-5" />} />
          <BottomLink href="/categories/sites" label="分类" active={active === "categories"} icon={<Grid2X2 className="size-5" />} />
          <BottomLink href="/me#favorites" label="收藏" active={active === "favorites"} icon={<Heart className="size-5" />} />
          <BottomLink href="/me" label="我的" active={active === "me"} icon={<UserRound className="size-5" />} />
        </div>
      </nav>
    </div>
  );
}

export function BrandMark({ content }: { content: SiteContent }) {
  return (
    <Link className="flex items-center gap-3" href="/">
      <Image
        alt={content.brandName}
        className="h-16 w-auto object-contain"
        height={145}
        priority
        src={content.logoImageUrl}
        width={310}
      />
      <span className="sr-only">{content.brandName}</span>
    </Link>
  );
}

export function PawBadge({ children, tone = "mint" }: { children: React.ReactNode; tone?: "mint" | "pink" | "plain" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tone === "mint" && "bg-brand-100 text-brand-700",
        tone === "pink" && "bg-coral-50 text-coral-600",
        tone === "plain" && "bg-white text-cream-500 shadow-sm ring-1 ring-cream-200"
      )}
    >
      <PawPrint className="size-3" />
      {children}
    </span>
  );
}

export function CatIcon() {
  return (
    <span className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-700 shadow-sm">
      <Cat className="size-5" />
    </span>
  );
}

function BottomLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link className={clsx("flex flex-col items-center gap-1 rounded-2xl py-1.5", active ? "text-brand-700" : "text-cream-500")} href={href as Route}>
      <span className={clsx("grid size-8 place-items-center rounded-xl", active && "bg-brand-100")}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
