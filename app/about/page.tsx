import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "关于我们",
  description: "猫片是一个合规观影导航。"
};

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-stone-950">关于我们</h1>
        <p className="mt-4 leading-7 text-stone-600">
          猫片整理片单灵感、观影工具和公开影视资讯入口，帮助用户更轻松地发现想看的内容。
        </p>
      </section>
    </SiteShell>
  );
}
