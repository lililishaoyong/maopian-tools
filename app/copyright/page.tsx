import { SiteShell } from "@/components/site-shell";

export const metadata = {
  title: "版权投诉",
  description: "百宝箱版权投诉与内容反馈入口。"
};

export default function CopyrightPage() {
  return (
    <SiteShell>
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-stone-950">版权投诉</h1>
        <p className="mt-4 leading-7 text-stone-600">
          如页面内容涉及权利争议，请通过联系方式提交权属证明、问题链接和处理诉求。我们会在核实后及时处理。
        </p>
      </section>
    </SiteShell>
  );
}
