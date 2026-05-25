import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download, Heart, Menu, Search, Share2 } from "lucide-react";
import { getResourceBySlug, getResources, getSiteContent } from "@/lib/data";

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
    title: resource ? `${resource.name} - 站内打开` : "站内浏览 - 猫片",
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function WebViewPage({ params }: Props) {
  const { slug } = await params;
  const [content, resource] = await Promise.all([getSiteContent(), getResourceBySlug(slug)]);

  if (!resource) {
    return (
      <main className="mx-auto min-h-screen max-w-[430px] bg-cream-50 p-6 text-center">
        <h1 className="mt-24 text-xl font-black text-cream-900">资源不存在</h1>
        <Link className="mt-4 inline-flex rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white" href="/">
          返回首页
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[430px] flex-col bg-[#101312] text-white shadow-card md:my-5 md:overflow-hidden md:rounded-[28px]">
      <header className="bg-cream-50 px-4 pb-3 pt-4 text-cream-900">
        <div className="flex items-center justify-between">
          <Link className="grid size-9 place-items-center rounded-full bg-white shadow-sm" href={`/tools/${resource.slug}`}>
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-black">{resource.name} - 站内打开</p>
            <p className="mt-0.5 text-[10px] text-cream-500">{content.brandName} WebView</p>
          </div>
          <Menu className="size-5" />
        </div>
      </header>

      <section className="border-b border-white/10 bg-[#151817] p-3">
        <div className="flex items-center gap-3">
          <Image
            alt=""
            className="size-8 rounded-lg bg-brand-100 object-cover"
            height={32}
            src={resource.iconUrl}
            width={32}
          />
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-xs text-white/55">
            <Search className="size-4" />
            搜索电影、剧集、动漫
          </div>
        </div>
      </section>

      <div className="relative min-h-0 flex-1">
        <iframe
          className="h-full min-h-[560px] w-full border-0 bg-white"
          referrerPolicy="no-referrer"
          sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          src={resource.officialUrl}
          title={resource.name}
        />
        <div className="pointer-events-none absolute inset-x-3 top-3 rounded-2xl border border-white/10 bg-black/55 p-3 text-xs leading-5 text-white/80 backdrop-blur">
          若目标站点禁止内嵌浏览，可使用下方“外部打开”继续访问。
        </div>
      </div>

      <footer className="grid grid-cols-4 gap-1 bg-white px-2 py-2 text-center text-[11px] text-cream-900">
        <Action icon={<Heart className="size-5" />} label="收藏" />
        <Action icon={<Share2 className="size-5" />} label="分享" />
        <a className="flex flex-col items-center gap-1 rounded-xl py-1.5" href={resource.officialUrl} rel="noreferrer" target="_blank">
          <Menu className="size-5" />
          外部打开
        </a>
        <Action icon={<Download className="size-5" />} label="下载" />
      </footer>
    </main>
  );
}

function Action({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-xl py-1.5" type="button">
      {icon}
      {label}
    </button>
  );
}
