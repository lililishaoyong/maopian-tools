import Image from "next/image";
import Link from "next/link";
import { Briefcase, Cat, Clapperboard, Film, Search, Sparkles, Tv } from "lucide-react";
import { BrandMark, CatIcon, MaopianShell } from "@/components/maopian-shell";
import { ResourceCard } from "@/components/resource-card";
import { getCategories, getFeaturedResources, getResources, getSiteContent } from "@/lib/data";

export const revalidate = 300;

const iconMap = {
  Clapperboard,
  Film,
  Tv,
  Cat,
  Sparkles,
  Briefcase
};

export default async function HomePage() {
  const [content, categories, resources, featured] = await Promise.all([
    getSiteContent(),
    getCategories(),
    getResources(),
    getFeaturedResources()
  ]);

  return (
    <MaopianShell active="home" content={content}>
      <header className="flex items-start justify-between">
        <BrandMark content={content} />
        <Link className="mt-3 grid size-10 place-items-center rounded-full bg-white text-coral-600 shadow-sm" href="/me">
          <Cat className="size-5" />
        </Link>
      </header>

      <section className="mt-3 rounded-3xl border border-cream-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-full border border-cream-200 bg-cream-50 px-3 py-2 text-xs text-cream-500">
          <Search className="size-4" />
          搜索片单、工具、入口
          <span className="ml-auto text-coral-500">🐾</span>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-3xl bg-brand-100 p-4 shadow-card">
        <div className="flex min-h-32 items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-tight text-brand-700">{content.bannerTitle}</h1>
            <p className="mt-2 text-sm font-bold text-brand-700">{content.bannerSubtitle}</p>
            <p className="mt-1 text-xs text-cream-500">{content.bannerCta}</p>
            <Link className="mt-4 inline-flex rounded-full bg-coral-500 px-4 py-2 text-xs font-bold text-white shadow-sm" href="/categories/sites">
              立即觅食
            </Link>
          </div>
          <Image
            alt=""
            className="h-28 w-40 shrink-0 object-contain"
            height={175}
            priority
            src={content.heroImageUrl}
            width={420}
          />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="flex items-center gap-1 text-sm font-black text-cream-900">
          🐾 分类导航
        </h2>
        <div className="mt-3 grid grid-cols-6 gap-2">
          {categories.map((category) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap] || Clapperboard;
            return (
              <Link className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-1 py-2 text-center shadow-sm" href={`/categories/${category.slug}`} key={category.slug}>
                <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="size-4" />
                </span>
                <span className="text-[10px] font-semibold text-cream-500">{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1 text-sm font-black text-cream-900">⭐ 推荐入口</h2>
          <span className="text-[11px] text-cream-500">{resources.length} 个入口</span>
        </div>
        <div className="mt-3 space-y-3">
          {(featured.length ? featured : resources).slice(0, 5).map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      <section className="mt-5 flex items-center gap-3 rounded-3xl border border-cream-200 bg-white p-4 shadow-sm">
        <CatIcon />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-cream-900">{content.followTitle}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-cream-500">{content.followDescription}</p>
        </div>
        <Link className="rounded-full bg-coral-500 px-3 py-2 text-xs font-bold text-white" href="/me">
          去关注
        </Link>
      </section>
    </MaopianShell>
  );
}
