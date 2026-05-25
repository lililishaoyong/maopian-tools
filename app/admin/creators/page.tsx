import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { CrawlProgressPanel } from "@/components/crawl-progress-panel";
import { getXCrawlStatus, getXCreators, getXSession } from "@/lib/data";
import { getXCrawlProxyDiagnostic } from "@/lib/x-crawler";
import type { XCreatorSource } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string; ok?: string }>;
};

export default async function AdminCreatorsPage({ searchParams }: Props) {
  const [{ error, ok }, creators, session, crawlStatus] = await Promise.all([
    searchParams,
    getXCreators(),
    getXSession(),
    getXCrawlStatus()
  ]);
  const proxyDiagnostic = getXCrawlProxyDiagnostic();

  return (
    <AdminShell active="creators" title="X 创作者采集">
      <AdminNotice error={error} ok={ok} />
      <CrawlProgressPanel initialStatus={crawlStatus} />

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-stone-950">新增创作者主页</h2>
                <p className="mt-1 text-sm text-stone-500">支持 https://x.com/handle 形式，采集结果进入审核池。</p>
              </div>
              <form action="/api/admin/crawl/x" method="post">
                <input name="full" type="hidden" value="on" />
                <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
                  全量采集全部
                </button>
              </form>
            </div>
            <CreatorForm />
          </section>

          {creators.map((creator) => (
            <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft" key={creator.id}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-stone-950">{creator.name}</h2>
                  <a className="text-sm text-brand-700" href={creator.profileUrl} rel="noreferrer" target="_blank">
                    @{creator.handle}
                  </a>
                  <p className="mt-1 text-xs text-stone-500">
                    上次采集：{creator.lastCrawledAt || "未采集"} · {creator.enabled ? "启用" : "停用"}
                  </p>
                  {creator.lastError && <p className="mt-1 text-xs text-rose-600">错误：{creator.lastError}</p>}
                </div>
                <div className="flex gap-2">
                  <form action="/api/admin/crawl/x" method="post">
                    <input name="creatorId" type="hidden" value={creator.id} />
                    <button className="rounded-lg border border-brand-100 px-3 py-2 text-sm text-brand-700" type="submit">
                      增量采集
                    </button>
                  </form>
                  <form action="/api/admin/crawl/x" method="post">
                    <input name="creatorId" type="hidden" value={creator.id} />
                    <input name="full" type="hidden" value="on" />
                    <button className="rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-700" type="submit">
                      全量
                    </button>
                  </form>
                  <form action="/api/admin/creators" method="post">
                    <input name="action" type="hidden" value="delete" />
                    <input name="id" type="hidden" value={creator.id} />
                    <button className="rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-700" type="submit">
                      删除
                    </button>
                  </form>
                </div>
              </div>
              <CreatorForm creator={creator} />
            </section>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-stone-950">X Cookie</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            当前状态：{session.isConfigured ? "已配置" : "未配置"}
            {session.updatedAt ? ` · ${session.updatedAt}` : ""}
          </p>
          <form action="/api/admin/x-session" className="mt-4 space-y-3" method="post">
            <textarea
              className="min-h-36 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-900"
              name="cookieText"
              placeholder="粘贴 X 请求 Cookie，例如 auth_token=...; ct0=..."
            />
            <button className="w-full rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white" type="submit">
              保存 Cookie
            </button>
          </form>
          <form action="/api/admin/x-session" className="mt-2" method="post">
            <input name="action" type="hidden" value="clear" />
            <button className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm text-stone-600" type="submit">
              清除 Cookie
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-stone-50 p-4">
            <h3 className="text-sm font-semibold text-stone-950">X 访问代理</h3>
            <p className="mt-2 text-sm leading-6 text-stone-500">{proxyDiagnostic.message}</p>
            <form action="/api/admin/crawl/x/test" className="mt-3" method="post">
              <button className="w-full rounded-lg border border-brand-100 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700" type="submit">
                测试代理和 X 访问
              </button>
            </form>
          </div>
        </aside>
      </section>
    </AdminShell>
  );
}

function CreatorForm({ creator }: { creator?: XCreatorSource }) {
  return (
    <form action="/api/admin/creators" className="mt-4 grid gap-4 md:grid-cols-2" method="post">
      <input name="id" type="hidden" value={creator?.id || ""} />
      <input name="lastCrawledAt" type="hidden" value={creator?.lastCrawledAt || ""} />
      <input name="lastTweetUrl" type="hidden" value={creator?.lastTweetUrl || ""} />
      <input name="lastError" type="hidden" value={creator?.lastError || ""} />
      <Field label="名称" name="name" value={creator?.name || ""} />
      <Field label="X 主页 URL" name="profileUrl" required value={creator?.profileUrl || ""} />
      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input defaultChecked={creator?.enabled ?? true} name="enabled" type="checkbox" />
        启用每日采集
      </label>
      <div className="flex justify-end md:col-span-2">
        <button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white" type="submit">
          保存创作者
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  value
}: {
  label: string;
  name: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-sm text-stone-600">
      {label}
      <input className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={value} name={name} required={required} />
    </label>
  );
}
