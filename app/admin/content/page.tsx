import Image from "next/image";
import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { getSiteContent } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

export default async function AdminContentPage({ searchParams }: Props) {
  const [{ error, ok }, content] = await Promise.all([searchParams, getSiteContent()]);

  return (
    <AdminShell active="content" title="内容维护">
      <AdminNotice error={error} ok={ok ? "保存成功" : undefined} />
      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <form action="/api/admin/content" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft" method="post">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="品牌名" name="brandName" value={content.brandName} />
            <Field label="Slug" name="brandSlug" value={content.brandSlug} />
            <Field className="md:col-span-2" label="Slogan" name="slogan" value={content.slogan} />
            <Field className="md:col-span-2" label="关键词" name="keywords" value={content.keywords} />
            <Field label="首页 Banner 标题" name="bannerTitle" value={content.bannerTitle} />
            <Field label="首页 Banner 副标题" name="bannerSubtitle" value={content.bannerSubtitle} />
            <Field className="md:col-span-2" label="首页 Banner CTA 文案" name="bannerCta" value={content.bannerCta} />
            <Field label="关注标题" name="followTitle" value={content.followTitle} />
            <TextArea label="关注描述" name="followDescription" value={content.followDescription} />
            <Field label="Logo URL" name="logoImageUrl" value={content.logoImageUrl} />
            <Field label="首页猫图 URL" name="heroImageUrl" value={content.heroImageUrl} />
            <Field label="头像 URL" name="avatarImageUrl" value={content.avatarImageUrl} />
            <Field label="二维码 URL" name="qrImageUrl" value={content.qrImageUrl} />
          </div>
          <div className="mt-5 flex justify-end">
            <button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white" type="submit">
              保存内容
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-stone-950">素材预览</h2>
          <div className="mt-4 space-y-4">
            <Preview alt="Logo" src={content.logoImageUrl} />
            <Preview alt="首页猫图" src={content.heroImageUrl} />
            <Preview alt="二维码" src={content.qrImageUrl} square />
          </div>
        </aside>
      </section>
    </AdminShell>
  );
}

function Field({
  className = "",
  label,
  name,
  value
}: {
  className?: string;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className={`grid gap-1 text-sm text-stone-600 ${className}`}>
      {label}
      <input className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={value} name={name} />
    </label>
  );
}

function TextArea({ label, name, value }: { label: string; name: string; value: string }) {
  return (
    <label className="grid gap-1 text-sm text-stone-600 md:col-span-2">
      {label}
      <textarea className="min-h-24 rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={value} name={name} />
    </label>
  );
}

function Preview({ alt, square, src }: { alt: string; square?: boolean; src: string }) {
  return (
    <div>
      <p className="mb-2 text-xs text-stone-500">{alt}</p>
      <Image
        alt={alt}
        className={`${square ? "aspect-square" : "aspect-[2/1]"} w-full rounded-xl border border-stone-200 object-contain`}
        height={160}
        src={src}
        width={260}
      />
    </div>
  );
}
