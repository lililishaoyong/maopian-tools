import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bell, CalendarCheck, ExternalLink, Gift, ShieldCheck } from "lucide-react";
import { MaopianShell } from "@/components/maopian-shell";
import { MiniResourceCard } from "@/components/resource-card";
import { absoluteUrl } from "@/lib/env";
import { getRelatedResources, getResourceBySlug, getResources, getSiteContent } from "@/lib/data";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const resources = await getResources();
  return resources.map((resource) => ({ slug: resource.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getResourceBySlug(slug);
  return {
    title: resource ? `${resource.name} - 猫片` : "资源详情 - 猫片",
    description: resource?.description || "猫片影视资源详情页。",
    alternates: {
      canonical: `/tools/${slug}`
    },
    openGraph: {
      title: resource?.name,
      description: resource?.description,
      url: absoluteUrl(`/tools/${slug}`)
    }
  };
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params;
  const [content, resource] = await Promise.all([getSiteContent(), getResourceBySlug(slug)]);

  if (!resource) {
    return (
      <MaopianShell content={content}>
        <h1 className="pt-20 text-center text-xl font-black">资源不存在</h1>
      </MaopianShell>
    );
  }

  const related = await getRelatedResources(resource);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: resource.name,
    description: resource.description,
    url: absoluteUrl(`/tools/${resource.slug}`)
  };

  return (
    <MaopianShell active="categories" content={content}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <header className="flex items-center justify-between">
        <Link className="grid size-10 place-items-center rounded-full bg-white text-cream-900 shadow-sm" href={`/categories/${resource.categorySlug}`}>
          <ArrowLeft className="size-5" />
        </Link>
        <span className="text-sm font-black text-cream-900">详情页</span>
        <span className="grid size-10 place-items-center rounded-full bg-white text-cream-900 shadow-sm">🐾</span>
      </header>

      <article className="mt-5 rounded-3xl border border-cream-200 bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <Image
            alt=""
            className="size-16 rounded-2xl border border-cream-200 bg-brand-100 object-cover"
            height={64}
            src={resource.iconUrl}
            width={64}
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-black text-cream-900">{resource.name}</h1>
            <p className="mt-2 text-[11px] text-cream-500">{resource.officialUrl}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2 text-center">
          <Feature icon={<Gift className="size-5" />} label={resource.features[0] || "资源丰富"} />
          <Feature icon={<CalendarCheck className="size-5" />} label={resource.features[1] || "更新及时"} />
          <Feature icon={<ShieldCheck className="size-5" />} label={resource.features[2] || "体验稳定"} />
          <Feature icon={<Bell className="size-5" />} label="支持站内打开" />
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-black text-cream-900">网站介绍</h2>
          <p className="mt-2 text-sm leading-7 text-cream-500">{resource.summary || resource.description}</p>
        </section>

        <section className="mt-5">
          <h2 className="text-sm font-black text-cream-900">资源亮点</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {resource.features.slice(0, 8).map((feature) => (
              <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-semibold text-brand-700" key={feature}>
                {feature}
              </span>
            ))}
          </div>
        </section>

        <Link
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm"
          href={`/view/${resource.slug}`}
        >
          🐾 立即访问（WebView）
          <ExternalLink className="size-4" />
        </Link>
      </article>

      <section className="mt-5">
        <h2 className="text-sm font-black text-cream-900">相关推荐</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(related.length ? related : [resource]).slice(0, 3).map((item) => (
            <MiniResourceCard key={item.id} resource={item} />
          ))}
        </div>
      </section>
    </MaopianShell>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="rounded-2xl bg-cream-50 px-1 py-3 text-brand-700">
      <div className="mx-auto grid size-7 place-items-center">{icon}</div>
      <p className="mt-1 text-[10px] font-semibold text-cream-500">{label}</p>
    </div>
  );
}
