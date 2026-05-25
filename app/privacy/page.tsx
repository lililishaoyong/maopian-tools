import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "隐私政策",
  description: "百宝箱隐私政策。"
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-stone-950">隐私政策</h1>
        <p className="mt-4 leading-7 text-stone-600">
          我们仅收集维持网站运行所需的基础访问日志和用户主动提交的信息。后台配置、导出文件和上传文件均通过服务器本地数据目录保存。
        </p>
      </section>
    </SiteShell>
  );
}
