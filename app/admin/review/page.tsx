import Link from "next/link";
import type { Route } from "next";
import { Check, ChevronLeft, ChevronRight, CircleSlash, ExternalLink, Save, ShieldAlert, X } from "lucide-react";
import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/badge";
import { getCategories, getReviewItems, getXCreators } from "@/lib/data";
import type { Category, ReviewItem, XCreatorSource } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    creatorId?: string;
    endDate?: string;
    error?: string;
    ok?: string;
    page?: string;
    pageSize?: string;
    startDate?: string;
    status?: string;
  }>;
};

const okText: Record<string, string> = {
  approved: "已通过，资源已发布。",
  reject: "已拒绝。",
  ignore: "已忽略。",
  saved: "审核项已保存。"
};

export default async function ReviewPage({ searchParams }: Props) {
  const [params, items, categories, creators] = await Promise.all([
    searchParams,
    getReviewItems(),
    getCategories({ includeHidden: true }),
    getXCreators()
  ]);
  const { error, ok } = params;
  const filters = filtersFromParams(params);
  const filteredItems = filterReviewItems(items, creators, filters);
  const pending = items.filter((item) => item.status === "pending");
  const highRisk = items.filter((item) => item.risk === "high");
  const xItems = items.filter((item) => item.sourceType === "x");
  const pageSize = parsePageSize(params.pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = clampPage(Number(params.page || 1), totalPages);
  const pageItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <AdminShell active="review" title="内容审核">
      <AdminNotice error={error} ok={ok ? okText[ok] || ok : undefined} />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="待审核" value={String(pending.length)} tone="amber" />
        <Metric label="X 采集" value={String(xItems.length)} tone="brand" />
        <Metric icon={<ShieldAlert className="size-5" />} label="高风险" value={String(highRisk.length)} tone="danger" />
        <Metric label="总条目" value={String(items.length)} />
      </div>

      <section className="mt-6 rounded-2xl border border-stone-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-5">
          <div>
            <h2 className="text-xl font-semibold text-stone-950">采集内容审核</h2>
            <p className="mt-1 text-sm text-stone-500">可先编辑分类、标题和摘要；通过后生成资源。当前筛选 {filteredItems.length} 条。</p>
          </div>
        </div>

        <ReviewFiltersForm creators={creators} filters={filters} pageSize={pageSize} />

        <div className="divide-y divide-stone-100">
          {pageItems.map((item) => (
            <ReviewEditor categories={categories} currentPage={currentPage} filters={filters} item={item} key={item.id} pageSize={pageSize} />
          ))}
          {!pageItems.length && <div className="p-8 text-center text-sm text-stone-500">没有符合条件的审核项。</div>}
        </div>
        <Pagination
          currentPage={currentPage}
          filters={filters}
          pageSize={pageSize}
          totalItems={filteredItems.length}
          totalPages={totalPages}
        />
      </section>
    </AdminShell>
  );
}

function ReviewEditor({
  categories,
  currentPage,
  filters,
  item,
  pageSize
}: {
  categories: Category[];
  currentPage: number;
  filters: ReviewFilters;
  item: ReviewItem;
  pageSize: number;
}) {
  const defaults = reviewDefaults(item);
  const disabled = item.status !== "pending";

  return (
    <form action="/api/admin/review" className="p-5" method="post">
      <input name="id" type="hidden" value={item.id} />
      <input name="page" type="hidden" value={currentPage} />
      <input name="pageSize" type="hidden" value={pageSize} />
      <input name="startDate" type="hidden" value={filters.startDate} />
      <input name="endDate" type="hidden" value={filters.endDate} />
      <input name="status" type="hidden" value={filters.status} />
      <input name="creatorId" type="hidden" value={filters.creatorId} />
      <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
        <aside>
          <div className="font-medium text-stone-950">{item.source}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone={item.status === "pending" ? "amber" : item.status === "approved" ? "brand" : "danger"}>
              {statusText(item.status)}
            </Badge>
            {item.sourceType === "x" && <Badge>X</Badge>}
          </div>
          {item.tweetUrl && (
            <a className="mt-3 inline-flex items-center gap-1 text-xs text-brand-700" href={item.tweetUrl} rel="noreferrer" target="_blank">
              查看原帖
              <ExternalLink className="size-3" />
            </a>
          )}
          {item.editedAt && <p className="mt-3 text-xs text-stone-400">编辑于 {item.editedAt}</p>}
        </aside>

        <div className="grid gap-4 md:grid-cols-2">
          <Field disabled={disabled} label="资源名称" name="resourceName" required value={defaults.resourceName} />
          <label className="grid gap-1 text-sm text-stone-600">
            分类
            <select
              className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900 disabled:bg-stone-50"
              defaultValue={defaults.categorySlug}
              disabled={disabled}
              name="suggestedCategorySlug"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <Field className="md:col-span-2" disabled={disabled} label="资源链接" name="resourceUrl" required value={defaults.resourceUrl} />
          <Field className="md:col-span-2" disabled={disabled} label="标题" name="title" value={defaults.title} />
          <TextArea disabled={disabled} label="正文摘要" name="summary" value={defaults.summary} />
          <TextArea disabled={disabled} label="一句话描述" name="description" value={defaults.description} />
          <TextArea disabled={disabled} label="特性（逗号或换行分隔）" name="features" value={defaults.features.join("，")} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {item.status === "pending" ? (
          <>
            <ActionButton action="save" icon={<Save className="size-3.5" />} label="保存编辑" />
            <ActionButton action="approve" icon={<Check className="size-3.5" />} label="通过并发布" tone="brand" />
            <ActionButton action="reject" icon={<X className="size-3.5" />} label="拒绝" tone="danger" />
            <ActionButton action="ignore" icon={<CircleSlash className="size-3.5" />} label="忽略" />
          </>
        ) : (
          <span className="text-xs text-stone-400">已处理</span>
        )}
      </div>
    </form>
  );
}

function Pagination({
  currentPage,
  filters,
  pageSize,
  totalItems,
  totalPages
}: {
  currentPage: number;
  filters: ReviewFilters;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}) {
  const start = totalItems ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-5 py-4 text-sm text-stone-600">
      <div>
        第 {currentPage} / {totalPages} 页，显示 {start}-{end} 条，共 {totalItems} 条
      </div>
      <div className="flex items-center gap-2">
        <PageSizeLink filters={filters} currentPage={currentPage} pageSize={10} selected={pageSize === 10} />
        <PageSizeLink filters={filters} currentPage={currentPage} pageSize={20} selected={pageSize === 20} />
        <PageSizeLink filters={filters} currentPage={currentPage} pageSize={50} selected={pageSize === 50} />
        <PageLink disabled={currentPage <= 1} filters={filters} page={currentPage - 1} pageSize={pageSize}>
          <ChevronLeft className="size-4" />
          上一页
        </PageLink>
        <PageLink disabled={currentPage >= totalPages} filters={filters} page={currentPage + 1} pageSize={pageSize}>
          下一页
          <ChevronRight className="size-4" />
        </PageLink>
      </div>
    </div>
  );
}

function PageSizeLink({
  filters,
  currentPage,
  pageSize,
  selected
}: {
  filters: ReviewFilters;
  currentPage: number;
  pageSize: number;
  selected: boolean;
}) {
  return (
    <Link
      className={`rounded-lg border px-3 py-2 text-xs ${selected ? "border-brand-100 bg-brand-50 text-brand-700" : "border-stone-200 text-stone-600"}`}
      href={reviewHref(currentPage, pageSize, filters) as Route}
    >
      {pageSize}/页
    </Link>
  );
}

function PageLink({
  children,
  disabled,
  filters,
  page,
  pageSize
}: {
  children: React.ReactNode;
  disabled: boolean;
  filters: ReviewFilters;
  page: number;
  pageSize: number;
}) {
  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg border border-stone-100 px-3 py-2 text-xs text-stone-300">
        {children}
      </span>
    );
  }

  return (
    <Link
      className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50"
      href={reviewHref(page, pageSize, filters) as Route}
    >
      {children}
    </Link>
  );
}

type ReviewFilters = {
  creatorId: string;
  endDate: string;
  startDate: string;
  status: "" | ReviewItem["status"];
};

function ReviewFiltersForm({
  creators,
  filters,
  pageSize
}: {
  creators: XCreatorSource[];
  filters: ReviewFilters;
  pageSize: number;
}) {
  return (
    <form className="grid gap-3 border-b border-stone-100 p-5 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]" method="get">
      <input name="pageSize" type="hidden" value={pageSize} />
      <label className="grid gap-1 text-sm text-stone-600">
        开始日期
        <input className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={filters.startDate} name="startDate" type="date" />
      </label>
      <label className="grid gap-1 text-sm text-stone-600">
        结束日期
        <input className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={filters.endDate} name="endDate" type="date" />
      </label>
      <label className="grid gap-1 text-sm text-stone-600">
        状态
        <select className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={filters.status} name="status">
          <option value="">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
          <option value="ignored">已忽略</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm text-stone-600">
        创作者
        <select className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={filters.creatorId} name="creatorId">
          <option value="">全部创作者</option>
          {creators.map((creator) => (
            <option key={creator.id} value={creator.id}>
              {creator.name} @{creator.handle}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button className="rounded-lg bg-stone-950 px-4 py-2 text-sm font-semibold text-white" type="submit">
          筛选
        </button>
        <Link className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600" href={`/admin/review?page=1&pageSize=${pageSize}` as Route}>
          重置
        </Link>
      </div>
    </form>
  );
}

function reviewHref(page: number, pageSize: number, filters: ReviewFilters) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.status) params.set("status", filters.status);
  if (filters.creatorId) params.set("creatorId", filters.creatorId);
  return `/admin/review?${params.toString()}`;
}

function filtersFromParams(params: Awaited<Props["searchParams"]>): ReviewFilters {
  const status = isReviewStatus(params.status) ? params.status : "";
  return {
    creatorId: params.creatorId || "",
    endDate: dateParam(params.endDate),
    startDate: dateParam(params.startDate),
    status
  };
}

function filterReviewItems(items: ReviewItem[], creators: XCreatorSource[], filters: ReviewFilters) {
  const creator = filters.creatorId ? creators.find((item) => item.id === filters.creatorId) : undefined;
  return items.filter((item) => {
    const collectedDate = dateParam(item.collectedAt.slice(0, 10));
    if (filters.startDate && collectedDate < filters.startDate) return false;
    if (filters.endDate && collectedDate > filters.endDate) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (creator && item.sourceProfile !== creator.profileUrl) return false;
    return true;
  });
}

function dateParam(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function isReviewStatus(value?: string): value is ReviewItem["status"] {
  return value === "pending" || value === "approved" || value === "rejected" || value === "ignored";
}

function parsePageSize(value?: string) {
  const parsed = Number(value || 10);
  return [10, 20, 50].includes(parsed) ? parsed : 10;
}

function clampPage(value: number, totalPages: number) {
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.min(Math.floor(value), totalPages);
}

function reviewDefaults(item: ReviewItem) {
  const resourceUrl = item.resourceUrl || item.url;
  const summary = item.summary || item.content || item.title;
  return {
    resourceUrl,
    resourceName: item.resourceName || hostFromUrl(resourceUrl),
    categorySlug: item.suggestedCategorySlug || "sites",
    title: item.title || hostFromUrl(resourceUrl),
    summary,
    description: item.description || summary.split("\n").find(Boolean)?.slice(0, 120) || item.title,
    features: item.features?.length ? item.features : ["影视资源", item.sourceType === "x" ? "来自 X 创作者" : "人工审核", "待人工确认"]
  };
}

function Field({
  className = "",
  disabled,
  label,
  name,
  required,
  value
}: {
  className?: string;
  disabled?: boolean;
  label: string;
  name: string;
  required?: boolean;
  value: string;
}) {
  return (
    <label className={`grid gap-1 text-sm text-stone-600 ${className}`}>
      {label}
      <input
        className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900 disabled:bg-stone-50"
        defaultValue={value}
        disabled={disabled}
        name={name}
        required={required}
      />
    </label>
  );
}

function TextArea({ disabled, label, name, value }: { disabled?: boolean; label: string; name: string; value: string }) {
  return (
    <label className="grid gap-1 text-sm text-stone-600">
      {label}
      <textarea
        className="min-h-24 rounded-lg border border-stone-200 px-3 py-2 text-stone-900 disabled:bg-stone-50"
        defaultValue={value}
        disabled={disabled}
        name={name}
      />
    </label>
  );
}

function ActionButton({
  action,
  icon,
  label,
  tone = "neutral"
}: {
  action: string;
  icon: React.ReactNode;
  label: string;
  tone?: "neutral" | "brand" | "danger";
}) {
  return (
    <button
      className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${
        tone === "brand"
          ? "border-brand-100 bg-brand-50 text-brand-700"
          : tone === "danger"
            ? "border-rose-100 bg-rose-50 text-rose-700"
            : "border-stone-200 text-stone-600"
      }`}
      name="action"
      type="submit"
      value={action}
    >
      {icon}
      {label}
    </button>
  );
}

function statusText(status: string) {
  return status === "pending" ? "待审核" : status === "approved" ? "已通过" : status === "rejected" ? "已拒绝" : "已忽略";
}

function hostFromUrl(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function Metric({
  icon,
  label,
  value,
  tone = "neutral"
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  tone?: "neutral" | "brand" | "amber" | "danger";
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>{label}</span>
        <span className="text-stone-400">{icon}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <strong className="text-2xl font-semibold text-stone-950">{value}</strong>
        <Badge tone={tone}>运行正常</Badge>
      </div>
    </div>
  );
}
