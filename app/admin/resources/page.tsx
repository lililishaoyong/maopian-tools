import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/badge";
import { getCategories, getResources } from "@/lib/data";
import type { Category, Resource, ResourceStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ create?: string; edit?: string; error?: string; ok?: string; page?: string; pageSize?: string }>;
};

const statusLabel: Record<ResourceStatus, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已下架"
};

const statusTone: Record<ResourceStatus, "neutral" | "brand" | "amber" | "danger"> = {
  draft: "amber",
  published: "brand",
  archived: "neutral"
};

export default async function AdminResourcesPage({ searchParams }: Props) {
  const [params, categories, resources] = await Promise.all([
    searchParams,
    getCategories({ includeHidden: true }),
    getResources({ includeDrafts: true })
  ]);
  const { create, edit, error, ok } = params;
  const pageSize = parsePageSize(params.pageSize);
  const totalPages = Math.max(1, Math.ceil(resources.length / pageSize));
  const currentPage = clampPage(Number(params.page || 1), totalPages);
  const pageResources = resources.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const categoryName = new Map(categories.map((category) => [category.slug, category.name]));

  return (
    <AdminShell active="resources" title="资源维护">
      <AdminNotice error={error} ok={ok ? okMessage(ok) : undefined} />
      {create === "1" && (
        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-950">新增资源</h2>
            <Link className="text-sm text-stone-500 hover:text-stone-900" href={resourcesHref(currentPage, pageSize) as Route}>
              取消
            </Link>
          </div>
          <ResourceForm categories={categories} page={currentPage} pageSize={pageSize} />
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">资源列表</h2>
            <p className="mt-1 text-sm text-stone-500">表格化展示资源，编辑时在当前行展开完整表单。</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">共 {resources.length} 条</span>
            <Link
              className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              href={resourcesHref(currentPage, pageSize, undefined, true) as Route}
            >
              <Plus className="size-4" />
              新增资源
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">名称</th>
                <th className="px-5 py-3 font-medium">分类</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 font-medium">更新时间</th>
                <th className="px-5 py-3 font-medium">排序</th>
                <th className="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pageResources.map((resource) => (
                <ResourceRow
                  categories={categories}
                  categoryName={categoryName.get(resource.categorySlug) || resource.categorySlug}
                  currentPage={currentPage}
                  editing={edit === resource.id}
                  key={resource.id}
                  pageSize={pageSize}
                  resource={resource}
                />
              ))}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={resources.length} totalPages={totalPages} />
      </section>
    </AdminShell>
  );
}

function okMessage(ok: string) {
  return ok === "resource-created" ? "资源已创建并发布，已在下方展开。" : ok === "draft-created" ? "资源草稿已创建，并已在下方展开。" : "保存成功";
}

function ResourceRow({
  categories,
  categoryName,
  currentPage,
  editing,
  pageSize,
  resource
}: {
  categories: Category[];
  categoryName: string;
  currentPage: number;
  editing: boolean;
  pageSize: number;
  resource: Resource;
}) {
  return (
    <>
      <tr className="align-top text-stone-700">
        <td className="px-5 py-4">
          <div className="font-medium text-stone-950">{resource.name}</div>
          <div className="mt-1 text-xs text-stone-500">/tools/{resource.slug}</div>
        </td>
        <td className="px-5 py-4">{categoryName}</td>
        <td className="px-5 py-4">
          <Badge tone={statusTone[resource.status]}>{statusLabel[resource.status]}</Badge>
        </td>
        <td className="px-5 py-4 text-stone-500">{resource.updatedAt}</td>
        <td className="px-5 py-4 text-stone-500">{resource.sortOrder}</td>
        <td className="px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <a
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs text-stone-600"
              href={`/tools/${resource.slug}`}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink className="size-3.5" />
              详情
            </a>
            <Link
              className="inline-flex items-center gap-1 rounded-lg border border-brand-100 px-2.5 py-1.5 text-xs text-brand-700"
              href={resourcesHref(currentPage, pageSize, resource.id) as Route}
            >
              <Pencil className="size-3.5" />
              编辑
            </Link>
            <form action="/api/admin/resources" method="post">
              <input name="action" type="hidden" value="delete" />
              <input name="id" type="hidden" value={resource.id} />
              <input name="page" type="hidden" value={currentPage} />
              <input name="pageSize" type="hidden" value={pageSize} />
              <button className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs text-rose-700" type="submit">
                <Trash2 className="size-3.5" />
                删除
              </button>
            </form>
          </div>
        </td>
      </tr>
      {editing && (
        <tr>
          <td className="bg-stone-50 px-5 py-5" colSpan={6}>
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-stone-950">编辑：{resource.name}</h3>
                <Link className="text-sm text-stone-500 hover:text-stone-900" href={resourcesHref(currentPage, pageSize) as Route}>
                  收起
                </Link>
              </div>
              <ResourceForm categories={categories} page={currentPage} pageSize={pageSize} resource={resource} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ResourceForm({
  categories,
  page,
  pageSize,
  resource
}: {
  categories: Category[];
  page: number;
  pageSize: number;
  resource?: Resource;
}) {
  return (
    <form action="/api/admin/resources" className="mt-4 grid gap-4 md:grid-cols-2" method="post">
      <input name="id" type="hidden" value={resource?.id || ""} />
      <input name="page" type="hidden" value={page} />
      <input name="pageSize" type="hidden" value={pageSize} />
      <Field label="名称" name="name" required value={resource?.name} />
      <Field label="Slug" name="slug" required value={resource?.slug} />
      <Field label="图标 URL" name="iconUrl" value={resource?.iconUrl || "/brand/avatar-cat.png"} />
      <label className="grid gap-1 text-sm text-stone-600">
        分类
        <select className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" name="categorySlug" defaultValue={resource?.categorySlug || categories[0]?.slug}>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm text-stone-600">
        状态
        <select className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" name="status" defaultValue={resource?.status || "draft"}>
          <option value="draft">草稿</option>
          <option value="published">已发布</option>
          <option value="archived">已下架</option>
        </select>
      </label>
      <Field label="排序" name="sortOrder" type="number" value={String(resource?.sortOrder ?? 100)} />
      <Field className="md:col-span-2" label="官网 URL" name="officialUrl" required value={resource?.officialUrl} />
      <Field className="md:col-span-2" label="一句话描述" name="description" value={resource?.description} />
      <TextArea label="网站介绍" name="summary" value={resource?.summary} />
      <TextArea label="特性（逗号或换行分隔）" name="features" value={resource?.features.join("，")} />
      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input defaultChecked={resource?.isFeatured ?? false} name="isFeatured" type="checkbox" />
        首页推荐
      </label>
      <div className="flex justify-end md:col-span-2">
        <button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white" type="submit">
          保存资源
        </button>
      </div>
    </form>
  );
}

function Pagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages
}: {
  currentPage: number;
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
        <PageSizeLink currentPage={currentPage} pageSize={10} selected={pageSize === 10} />
        <PageSizeLink currentPage={currentPage} pageSize={20} selected={pageSize === 20} />
        <PageSizeLink currentPage={currentPage} pageSize={50} selected={pageSize === 50} />
        <PageLink disabled={currentPage <= 1} page={currentPage - 1} pageSize={pageSize}>
          <ChevronLeft className="size-4" />
          上一页
        </PageLink>
        <PageLink disabled={currentPage >= totalPages} page={currentPage + 1} pageSize={pageSize}>
          下一页
          <ChevronRight className="size-4" />
        </PageLink>
      </div>
    </div>
  );
}

function PageSizeLink({
  currentPage,
  pageSize,
  selected
}: {
  currentPage: number;
  pageSize: number;
  selected: boolean;
}) {
  return (
    <Link
      className={`rounded-lg border px-3 py-2 text-xs ${selected ? "border-brand-100 bg-brand-50 text-brand-700" : "border-stone-200 text-stone-600"}`}
      href={resourcesHref(currentPage, pageSize) as Route}
    >
      {pageSize}/页
    </Link>
  );
}

function PageLink({
  children,
  disabled,
  page,
  pageSize
}: {
  children: React.ReactNode;
  disabled: boolean;
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
      href={resourcesHref(page, pageSize) as Route}
    >
      {children}
    </Link>
  );
}

function resourcesHref(page: number, pageSize: number, edit?: string, create?: boolean) {
  const editQuery = edit ? `&edit=${encodeURIComponent(edit)}` : "";
  const createQuery = create ? "&create=1" : "";
  return `/admin/resources?page=${page}&pageSize=${pageSize}${editQuery}${createQuery}`;
}

function parsePageSize(value?: string) {
  const parsed = Number(value || 20);
  return [10, 20, 50].includes(parsed) ? parsed : 20;
}

function clampPage(value: number, totalPages: number) {
  if (!Number.isFinite(value) || value < 1) return 1;
  return Math.min(Math.floor(value), totalPages);
}

function Field({
  className = "",
  label,
  name,
  required,
  type = "text",
  value = ""
}: {
  className?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value?: string;
}) {
  return (
    <label className={`grid gap-1 text-sm text-stone-600 ${className}`}>
      {label}
      <input className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={value} name={name} required={required} type={type} />
    </label>
  );
}

function TextArea({ label, name, value = "" }: { label: string; name: string; value?: string }) {
  return (
    <label className="grid gap-1 text-sm text-stone-600">
      {label}
      <textarea className="min-h-24 rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={value} name={name} />
    </label>
  );
}
