import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, Download, Info, MessageSquare, Settings, Star } from "lucide-react";
import { MaopianShell } from "@/components/maopian-shell";
import { getResources, getSiteContent } from "@/lib/data";

export const revalidate = 300;

export default async function MePage() {
  const [content, resources] = await Promise.all([getSiteContent(), getResources()]);

  return (
    <MaopianShell active="me" content={content}>
      <header className="flex justify-end">
        <span className="grid size-10 place-items-center rounded-full bg-white text-cream-900 shadow-sm">
          <Settings className="size-5" />
        </span>
      </header>

      <section className="mt-2 rounded-3xl border border-cream-200 bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <Image
            alt=""
            className="size-16 rounded-full border border-cream-200 object-cover"
            height={64}
            src={content.avatarImageUrl}
            width={64}
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-black text-cream-900">喵星人</h1>
            <p className="mt-1 text-xs text-cream-500">{content.slogan}</p>
          </div>
          <Link className="rounded-full bg-brand-100 px-3 py-2 text-xs font-bold text-brand-700" href="#follow">
            登录/注册
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-4 rounded-2xl bg-cream-50 py-3 text-center">
          <Metric value={resources.length} label="我的收藏" />
          <Metric value="28" label="浏览历史" />
          <Metric value="5" label="关注网站" />
          <Metric value="0" label="下载记录" />
        </div>
      </section>

      <section id="favorites" className="mt-4 overflow-hidden rounded-3xl border border-cream-200 bg-white shadow-sm">
        <MenuItem icon={<Star className="size-4" />} label="我的收藏" />
        <MenuItem icon={<Clock className="size-4" />} label="浏览历史" />
        <MenuItem icon={<Download className="size-4" />} label="下载记录" />
        <MenuItem icon={<MessageSquare className="size-4" />} label="意见反馈" />
        <MenuItem icon={<Info className="size-4" />} label="关于猫片" />
      </section>

      <section id="follow" className="mt-5 rounded-3xl border border-coral-100 bg-white p-4 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-black text-coral-600">{content.followTitle}</h2>
            <p className="mt-3 text-xs leading-6 text-cream-500">{content.followDescription}</p>
          </div>
          <span className="text-xl text-cream-500">×</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-xs leading-6 text-cream-500">
            <p>热门网站更新提醒</p>
            <p>不迷路，资源永相伴</p>
          </div>
          <Image
            alt="公众号二维码"
            className="size-24 rounded-xl border border-cream-200 object-cover"
            height={105}
            src={content.qrImageUrl}
            width={105}
          />
        </div>
        <a className="mt-5 block rounded-2xl bg-coral-500 px-4 py-3 text-center text-sm font-black text-white shadow-sm" href="#follow">
          去关注公众号 🐾
        </a>
      </section>
    </MaopianShell>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <strong className="block text-sm font-black text-cream-900">{value}</strong>
      <span className="mt-1 block text-[10px] text-cream-500">{label}</span>
    </div>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full items-center gap-3 border-b border-cream-100 px-4 py-4 text-left text-sm last:border-b-0" type="button">
      <span className="grid size-8 place-items-center rounded-xl bg-cream-50 text-cream-500">{icon}</span>
      <span className="flex-1 font-semibold text-cream-900">{label}</span>
      <ChevronRight className="size-4 text-cream-500" />
    </button>
  );
}
