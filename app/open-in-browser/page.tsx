import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { siteUrl } from "@/lib/env";

export const metadata = {
  title: "请在浏览器中打开",
  description: "猫片访问提示：建议在浏览器中打开 miaopian.top。"
};

const displayHost = "miaopian.top";

export default function OpenInBrowserPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-8 text-stone-950 sm:px-8">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">猫片访问提示</h1>

        <div className="mt-8 overflow-hidden rounded-xl border border-stone-100 bg-white shadow-soft">
          <Image
            alt="请点击右上角，选择在浏览器打开，然后访问下方网址。"
            className="h-auto w-full"
            height={900}
            priority
            src="/brand/open-in-browser-guide.png"
            width={1200}
          />
        </div>

        <section className="mt-8 space-y-4 text-lg leading-8 text-stone-800">
          <p>
            <span className="mr-4 font-semibold text-stone-950">主站：</span>
            <a className="font-semibold text-sky-700 underline underline-offset-4" href={siteUrl}>
              {displayHost}
            </a>
          </p>

          <p>
            如果你正在微信内访问，请点击右上角菜单，选择
            <span className="font-semibold text-stone-950">“在浏览器打开”</span>
            后再访问本站。
          </p>

          <p>
            建议使用 Edge、Chrome、Firefox、Safari 等浏览器访问。手机端也可以使用系统自带浏览器打开。
          </p>

          <a
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-brand-700"
            href={siteUrl}
          >
            打开 {displayHost}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </section>
      </article>
    </main>
  );
}
