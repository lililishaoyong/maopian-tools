import Link from "next/link";
import type { Route } from "next";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminNotice, AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/badge";
import { IconNameField, IconPreview } from "@/components/icon-name-field";
import { getCategories } from "@/lib/data";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ create?: string; edit?: string; error?: string; ok?: string }>;
};

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const [{ create, edit, error, ok }, categories] = await Promise.all([
    searchParams,
    getCategories({ includeHidden: true })
  ]);

  return (
    <AdminShell active="categories" title="分类维护">
      <AdminNotice error={error} ok={ok ? "保存成功" : undefined} />

      {create === "1" && (
        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-stone-950">新增分类</h2>
            <Link className="text-sm text-stone-500 hover:text-stone-900" href="/admin/categories">
              取消
            </Link>
          </div>
          <CategoryForm />
        </section>
      )}

      <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 p-5">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">分类列表</h2>
            <p className="mt-1 text-sm text-stone-500">紧凑表格管理分类，编辑时在当前行展开表单。</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">共 {categories.length} 个分类</span>
            <Link
              className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
              href="/admin/categories?create=1"
            >
              <Plus className="size-4" />
              新增分类
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">名称</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">图标</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 font-medium">排序</th>
                <th className="px-5 py-3 font-medium">描述</th>
                <th className="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map((category) => (
                <CategoryRow category={category} editing={edit === category.id} key={category.id} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}

function CategoryRow({ category, editing }: { category: Category; editing: boolean }) {
  return (
    <>
      <tr className="align-top text-stone-700">
        <td className="px-5 py-4">
          <div className="font-medium text-stone-950">{category.name}</div>
        </td>
        <td className="px-5 py-4 text-stone-500">/{category.slug}</td>
        <td className="px-5 py-4 text-stone-500">
          <IconPreview compact name={category.icon} />
        </td>
        <td className="px-5 py-4">
          <Badge tone={category.isVisible ? "brand" : "neutral"}>
            <span className="inline-flex items-center gap-1">
              {category.isVisible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
              {category.isVisible ? "显示" : "隐藏"}
            </span>
          </Badge>
        </td>
        <td className="px-5 py-4 text-stone-500">{category.sortOrder}</td>
        <td className="max-w-xs px-5 py-4 text-stone-500">
          <p className="line-clamp-2">{category.description || "-"}</p>
        </td>
        <td className="px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex items-center gap-1 rounded-lg border border-brand-100 px-2.5 py-1.5 text-xs text-brand-700"
              href={`/admin/categories?edit=${encodeURIComponent(category.id)}` as Route}
            >
              <Pencil className="size-3.5" />
              编辑
            </Link>
            <form action="/api/admin/categories" method="post">
              <input name="action" type="hidden" value="delete" />
              <input name="id" type="hidden" value={category.id} />
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
          <td className="bg-stone-50 px-5 py-5" colSpan={7}>
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-stone-950">编辑：{category.name}</h3>
                <Link className="text-sm text-stone-500 hover:text-stone-900" href="/admin/categories">
                  收起
                </Link>
              </div>
              <CategoryForm category={category} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function CategoryForm({ category }: { category?: Category }) {
  return (
    <form action="/api/admin/categories" className="mt-4 grid gap-4 md:grid-cols-2" method="post">
      <input name="id" type="hidden" value={category?.id || ""} />
      <input name="edit" type="hidden" value={category?.id || ""} />
      <Field label="名称" name="name" required value={category?.name} />
      <Field label="Slug" name="slug" required value={category?.slug} />
      <IconNameField className="md:col-span-2" label="图标名" name="icon" value={category?.icon || "Clapperboard"} />
      <Field label="排序" name="sortOrder" type="number" value={String(category?.sortOrder ?? 100)} />
      <label className="grid gap-1 text-sm text-stone-600 md:col-span-2">
        描述
        <textarea className="min-h-20 rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={category?.description || ""} name="description" />
      </label>
      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input defaultChecked={category?.isVisible ?? true} name="isVisible" type="checkbox" />
        前台显示
      </label>
      <div className="flex justify-end md:col-span-2">
        <button className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white" type="submit">
          保存分类
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  value = ""
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value?: string;
}) {
  return (
    <label className="grid gap-1 text-sm text-stone-600">
      {label}
      <input className="rounded-lg border border-stone-200 px-3 py-2 text-stone-900" defaultValue={value} name={name} required={required} type={type} />
    </label>
  );
}
