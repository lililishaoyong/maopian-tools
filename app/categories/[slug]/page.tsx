import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { MaopianShell } from "@/components/maopian-shell";
import { ResourceCard } from "@/components/resource-card";
import { getCategories, getResourcesByCategory, getSiteContent } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  return {
    title: category ? `${category.name} - 猫片` : "影视分类 - 猫片",
    description: category?.description || "猫片观影导航分类页。",
    alternates: {
      canonical: `/categories/${slug}`
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [content, categories, categoryResources] = await Promise.all([
    getSiteContent(),
    getCategories(),
    getResourcesByCategory(slug)
  ]);
  const category = categories.find((item) => item.slug === slug);

  return (
    <MaopianShell active="categories" content={content}>
      <header className="flex items-center justify-between">
        <Link className="grid size-10 place-items-center rounded-full bg-white text-cream-900 shadow-sm" href="/">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="text-center">
          <h1 className="text-base font-black text-cream-900">{category?.name || "影视入口"}</h1>
          <p className="mt-0.5 text-[11px] text-cream-500">{categoryResources.length} 个入口</p>
        </div>
        <span className="grid size-10 place-items-center rounded-full bg-white text-cream-900 shadow-sm">
          <Search className="size-5" />
        </span>
      </header>

      <section className="mt-5 rounded-3xl border border-cream-200 bg-white p-4 shadow-sm">
        <p className="text-sm leading-6 text-cream-500">
          {category?.description || "精选稳定好用的公开影视资讯入口。"}
        </p>
      </section>

      <section className="mt-4 space-y-3">
        {categoryResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
        {!categoryResources.length && (
          <div className="rounded-3xl border border-dashed border-cream-200 bg-white p-8 text-center text-sm text-cream-500">
            这个分类还在晒太阳，稍后再来看看。
          </div>
        )}
      </section>
    </MaopianShell>
  );
}
