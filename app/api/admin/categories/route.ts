import { NextRequest, NextResponse } from "next/server";
import { assertSlug, getCategories, getResources, newId, saveCategories } from "@/lib/data";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const action = String(form.get("action") || "save");
  const edit = String(form.get("edit") || "");

  try {
    const categories = await getCategories({ includeHidden: true });

    if (action === "delete") {
      const id = String(form.get("id") || "");
      const target = categories.find((category) => category.id === id);
      const resources = await getResources({ includeDrafts: true });
      if (target && resources.some((resource) => resource.categorySlug === target.slug)) {
        throw new Error("该分类下仍有资源，不能删除。");
      }
      await saveCategories(categories.filter((category) => category.id !== id));
      return redirectTo(request, "/admin/categories?ok=deleted");
    }

    const nextCategory = categoryFromForm(form);
    const duplicate = categories.find(
      (category) => category.slug === nextCategory.slug && category.id !== nextCategory.id
    );
    if (duplicate) throw new Error("Slug 已存在。");

    const exists = categories.some((category) => category.id === nextCategory.id);
    const nextCategories = exists
      ? categories.map((category) => (category.id === nextCategory.id ? nextCategory : category))
      : [...categories, nextCategory];

    await saveCategories(nextCategories);
    return redirectTo(request, "/admin/categories?ok=saved");
  } catch (error) {
    const editQuery = edit ? `&edit=${encodeURIComponent(edit)}` : "";
    return redirectTo(request, `/admin/categories?error=${encodeURIComponent(errorMessage(error))}${editQuery}`);
  }
}

function categoryFromForm(form: FormData): Category {
  const id = String(form.get("id") || "") || newId("cat");
  const slug = String(form.get("slug") || "").trim();
  const name = String(form.get("name") || "").trim();
  if (!name) throw new Error("分类名称必填。");
  if (!slug) throw new Error("分类 slug 必填。");
  assertSlug(slug);

  return {
    id,
    slug,
    name,
    icon: String(form.get("icon") || "Clapperboard").trim() || "Clapperboard",
    description: String(form.get("description") || "").trim(),
    sortOrder: Number(form.get("sortOrder") || 100),
    isVisible: form.get("isVisible") === "on"
  };
}

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "保存失败，请检查 Redis 连接。";
}
