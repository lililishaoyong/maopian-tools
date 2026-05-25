import { NextRequest } from "next/server";
import { redirectToAdmin } from "@/lib/admin-redirect";
import {
  assertSlug,
  assertUrl,
  getCategories,
  getResources,
  newId,
  saveResources
} from "@/lib/data";
import type { Resource, ResourceStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const statuses: ResourceStatus[] = ["draft", "published", "archived"];

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const action = String(form.get("action") || "save");
  const page = String(form.get("page") || "1");
  const pageSize = String(form.get("pageSize") || "20");

  try {
    const resources = await getResources({ includeDrafts: true });

    if (action === "delete") {
      const id = String(form.get("id") || "");
      await saveResources(resources.filter((resource) => resource.id !== id));
      return redirectToAdmin(resourcesPath("deleted", page, pageSize));
    }

    const nextResource = await resourceFromForm(form);
    const duplicate = resources.find(
      (resource) => resource.slug === nextResource.slug && resource.id !== nextResource.id
    );
    if (duplicate) throw new Error("Slug 已存在。");

    const exists = resources.some((resource) => resource.id === nextResource.id);
    const nextResources = exists
      ? resources.map((resource) => (resource.id === nextResource.id ? nextResource : resource))
      : [...resources, nextResource];

    await saveResources(nextResources);
    return redirectToAdmin(resourcesPath("saved", page, pageSize));
  } catch (error) {
    return redirectToAdmin(`${resourcesPath("", page, pageSize)}&error=${encodeURIComponent(errorMessage(error))}`);
  }
}

async function resourceFromForm(form: FormData): Promise<Resource> {
  const id = String(form.get("id") || "") || newId("res");
  const slug = String(form.get("slug") || "").trim();
  const name = String(form.get("name") || "").trim();
  const categorySlug = String(form.get("categorySlug") || "").trim();
  const officialUrl = String(form.get("officialUrl") || "").trim();
  const status = String(form.get("status") || "draft") as ResourceStatus;

  if (!name) throw new Error("资源名称必填。");
  if (!slug) throw new Error("资源 slug 必填。");
  assertSlug(slug);
  assertUrl(officialUrl);
  if (!statuses.includes(status)) throw new Error("资源状态不合法。");

  const categories = await getCategories({ includeHidden: true });
  if (!categories.some((category) => category.slug === categorySlug)) {
    throw new Error("请选择有效分类。");
  }

  return {
    id,
    slug,
    name,
    iconUrl: String(form.get("iconUrl") || "/brand/avatar-cat.png").trim() || "/brand/avatar-cat.png",
    categorySlug,
    description: String(form.get("description") || "").trim(),
    summary: String(form.get("summary") || "").trim(),
    features: parseFeatureList(form.get("features")),
    officialUrl,
    status,
    sortOrder: Number(form.get("sortOrder") || 100),
    isFeatured: form.get("isFeatured") === "on",
    updatedAt: new Date().toISOString().slice(0, 10)
  };
}

function resourcesPath(ok: string, page: string, pageSize: string) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = [10, 20, 50].includes(Number(pageSize)) ? Number(pageSize) : 20;
  const okQuery = ok ? `ok=${encodeURIComponent(ok)}&` : "";
  return `/admin/resources?${okQuery}page=${safePage}&pageSize=${safePageSize}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "保存失败，请检查 Redis 连接。";
}

function parseFeatureList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
