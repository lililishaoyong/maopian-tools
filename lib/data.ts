import { revalidatePath } from "next/cache";
import { categories, resources, siteContent } from "./seed";
import { getRedis } from "./redis";
import type { Category, Resource, SiteContent } from "./types";

const KEYS = {
  categories: "maopian:categories",
  resources: "maopian:resources",
  siteContent: "maopian:siteContent"
};

export async function getCategories({ includeHidden = false } = {}): Promise<Category[]> {
  const items = await readJson<Category[]>(KEYS.categories, categories);
  return items
    .filter((category) => includeHidden || category.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getResources({ includeDrafts = false } = {}): Promise<Resource[]> {
  const items = await readJson<Resource[]>(KEYS.resources, resources);
  return items
    .filter((resource) => includeDrafts || resource.status === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getTools() {
  return getResources();
}

export async function getToolsByCategory(slug: string) {
  return getResourcesByCategory(slug);
}

export async function getResourceBySlug(slug: string, { includeDrafts = false } = {}) {
  const allResources = await getResources({ includeDrafts });
  return allResources.find((resource) => resource.slug === slug) || null;
}

export async function getToolBySlug(slug: string) {
  return getResourceBySlug(slug);
}

export async function getResourcesByCategory(slug: string, { includeDrafts = false } = {}) {
  const allResources = await getResources({ includeDrafts });
  return allResources.filter((resource) => resource.categorySlug === slug);
}

export async function getFeaturedResources() {
  const allResources = await getResources();
  return allResources.filter((resource) => resource.isFeatured).slice(0, 6);
}

export async function getRelatedResources(resource: Resource) {
  const allResources = await getResources();
  return allResources
    .filter((item) => item.slug !== resource.slug && item.categorySlug === resource.categorySlug)
    .slice(0, 3);
}

export async function getSiteContent(): Promise<SiteContent> {
  return readJson<SiteContent>(KEYS.siteContent, siteContent);
}

export async function saveCategories(nextCategories: Category[]) {
  await writeJson(KEYS.categories, nextCategories.sort((a, b) => a.sortOrder - b.sortOrder));
  revalidatePublicPages();
}

export async function saveResources(nextResources: Resource[]) {
  await writeJson(KEYS.resources, nextResources.sort((a, b) => a.sortOrder - b.sortOrder));
  revalidatePublicPages();
}

export async function saveSiteContent(nextContent: SiteContent) {
  await writeJson(KEYS.siteContent, nextContent);
  revalidatePublicPages();
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function assertSlug(value: string) {
  if (!/^[a-z0-9-]+$/.test(value)) {
    throw new Error("Slug 只能包含小写字母、数字和连字符。");
  }
}

export function assertUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("bad protocol");
  } catch {
    throw new Error("请输入合法的 http/https URL。");
  }
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const redis = await getRedis();
    const raw = await redis.get(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown) {
  try {
    const redis = await getRedis();
    await redis.set(key, JSON.stringify(value));
  } catch {
    throw new Error("Redis 不可用，无法保存后台内容。");
  }
}

function revalidatePublicPages() {
  safeRevalidatePath("/");
  safeRevalidatePath("/categories/[slug]", "page");
  safeRevalidatePath("/tools/[slug]", "page");
  safeRevalidatePath("/view/[slug]", "page");
  safeRevalidatePath("/me");
  safeRevalidatePath("/admin/resources");
  safeRevalidatePath("/admin/categories");
  safeRevalidatePath("/admin/content");
}

function safeRevalidatePath(path: string, type?: "page" | "layout") {
  try {
    if (type) {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }
  } catch {
    // Some admin writes can run outside the Next.js request cache context.
  }
}
