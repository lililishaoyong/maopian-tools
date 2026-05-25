import { NextRequest } from "next/server";
import { redirectToAdmin } from "@/lib/admin-redirect";
import { assertUrl, getCategories, getResources, getReviewItems, newId, saveResources, saveReviewItems } from "@/lib/data";
import type { Resource, ReviewItem } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const action = String(form.get("action") || "");
  const id = String(form.get("id") || "");
  const page = String(form.get("page") || "1");
  const pageSize = String(form.get("pageSize") || "10");
  const filters = filtersFromForm(form);

  try {
    const reviewItems = await getReviewItems();
    const item = reviewItems.find((reviewItem) => reviewItem.id === id);
    if (!item) throw new Error("审核项不存在。");

    if (action === "save") {
      const editedItem = await reviewItemFromForm(item, form);
      await saveReviewItems(reviewItems.map((reviewItem) => (reviewItem.id === id ? editedItem : reviewItem)));
      return redirectToAdmin(reviewPath("saved", page, pageSize, filters));
    }

    if (action === "approve") {
      const editedItem = await reviewItemFromForm(item, form);
      const resources = await getResources({ includeDrafts: true });
      const existingResource = resources.find((resource) => resource.officialUrl === (editedItem.resourceUrl || editedItem.url));
      if (existingResource) {
        await saveReviewItems(
          reviewItems.map((reviewItem) =>
            reviewItem.id === id ? { ...editedItem, status: "approved", editedAt: new Date().toISOString() } : reviewItem
          )
        );
        return redirectToAdmin(reviewPath("approved", page, pageSize, filters));
      }
      const nextResource = resourceDraftFromReview(editedItem, resources);
      await saveResources([...resources, nextResource]);
      await saveReviewItems(
        reviewItems.map((reviewItem) =>
          reviewItem.id === id ? { ...editedItem, status: "approved", editedAt: new Date().toISOString() } : reviewItem
        )
      );
      return redirectToAdmin(reviewPath("approved", page, pageSize, filters));
    }

    if (action === "reject" || action === "ignore") {
      await saveReviewItems(
        reviewItems.map((reviewItem) =>
          reviewItem.id === id ? { ...reviewItem, status: action === "reject" ? "rejected" : "ignored" } : reviewItem
        )
      );
      return redirectToAdmin(reviewPath(action, page, pageSize, filters));
    }

    throw new Error("未知审核操作。");
  } catch (error) {
    return redirectToAdmin(reviewPath("", page, pageSize, { ...filters, error: errorMessage(error) }));
  }
}

type ReviewFilters = {
  startDate?: string;
  endDate?: string;
  status?: string;
  creatorId?: string;
  error?: string;
};

function filtersFromForm(form: FormData): ReviewFilters {
  return {
    startDate: String(form.get("startDate") || ""),
    endDate: String(form.get("endDate") || ""),
    status: String(form.get("status") || ""),
    creatorId: String(form.get("creatorId") || "")
  };
}

function reviewPath(ok: string, page: string, pageSize: string, filters: ReviewFilters = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = [10, 20, 50].includes(Number(pageSize)) ? Number(pageSize) : 10;
  const params = new URLSearchParams();
  if (ok) params.set("ok", ok);
  if (filters.error) params.set("error", filters.error);
  params.set("page", String(safePage));
  params.set("pageSize", String(safePageSize));
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.status) params.set("status", filters.status);
  if (filters.creatorId) params.set("creatorId", filters.creatorId);
  return `/admin/review?${params.toString()}`;
}

async function reviewItemFromForm(item: ReviewItem, form: FormData): Promise<ReviewItem> {
  const resourceUrl = String(form.get("resourceUrl") || item.resourceUrl || item.url).trim();
  const resourceName = String(form.get("resourceName") || item.resourceName || hostFromUrl(resourceUrl)).trim();
  const categorySlug = String(form.get("suggestedCategorySlug") || item.suggestedCategorySlug || "sites").trim();

  if (!resourceName) throw new Error("资源名称必填。");
  assertUrl(resourceUrl);
  await assertCategory(categorySlug);

  const title = String(form.get("title") || item.title || resourceName).trim();
  const summary = String(form.get("summary") || item.summary || item.content || title).trim();
  const description = String(form.get("description") || item.description || summary.split("\n").find(Boolean) || title)
    .trim()
    .slice(0, 120);

  return {
    ...item,
    title: title || resourceName,
    url: resourceUrl,
    resourceUrl,
    resourceName,
    suggestedCategorySlug: categorySlug,
    description,
    summary,
    content: summary,
    features: parseList(form.get("features")).length ? parseList(form.get("features")) : defaultFeatures(item),
    editedAt: new Date().toISOString()
  };
}

function resourceDraftFromReview(item: ReviewItem, resources: Resource[]): Resource {
  const resourceUrl = item.resourceUrl || item.url;
  const host = hostFromUrl(resourceUrl);
  const slug = `${slugify(item.resourceName || host)}-${Date.now().toString(36)}`;
  const summary = item.summary || item.content || item.title;
  const firstSortOrder = resources.length ? Math.min(...resources.map((resource) => resource.sortOrder)) : 100;

  return {
    id: newId("res"),
    slug,
    name: item.resourceName || host,
    iconUrl: "/brand/avatar-cat.png",
    categorySlug: item.suggestedCategorySlug || "sites",
    description: item.description || summary.split("\n").find(Boolean)?.slice(0, 80) || `${host} 影视资源入口`,
    summary,
    features: item.features?.length ? item.features : defaultFeatures(item),
    officialUrl: resourceUrl,
    status: "published",
    sortOrder: firstSortOrder - 1,
    isFeatured: false,
    updatedAt: new Date().toISOString().slice(0, 10)
  };
}

async function assertCategory(slug: string) {
  const categories = await getCategories({ includeHidden: true });
  if (!categories.some((category) => category.slug === slug)) {
    throw new Error("请选择有效分类。");
  }
}

function defaultFeatures(item: ReviewItem) {
  return item.features?.length ? item.features : ["影视资源", item.sourceType === "x" ? "来自 X 创作者" : "人工审核", "待人工确认"];
}

function hostFromUrl(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "resource";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "审核操作失败。";
}

function parseList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
