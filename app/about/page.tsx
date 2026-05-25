import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "关于我们",
  description: "百宝箱是一个实用网站与在线工具目录。"
};

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-stone-950">关于我们</h1>
        <p className="mt-4 leading-7 text-stone-600">
          百宝箱收录实用网站、在线工具和免费正版内容入口，帮助用户更快找到可用、轻量、可信的工具。
        </p>
      </section>
    </SiteShell>
  );
}
