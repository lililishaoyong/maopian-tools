import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "联系方式",
  description: "联系百宝箱。"
};

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-stone-950">联系方式</h1>
        <p className="mt-4 leading-7 text-stone-600">
          商务收录、内容反馈和版权投诉可发送邮件至 support@example.com。上线前请在后台或环境配置中替换为真实联系方式。
        </p>
      </section>
    </SiteShell>
  );
}
