import { revalidatePath } from "next/cache";
import { categories, resources, reviewItems, siteContent, xCreators, xSession } from "./seed";
import { getRedis } from "./redis";
import type { Category, Resource, ReviewItem, SiteContent, XCrawlStatus, XCreatorSource, XSessionConfig } from "./types";

const KEYS = {
  categories: "maopian:categories",
  resources: "maopian:resources",
  siteContent: "maopian:siteContent",
  reviewItems: "review:items",
  xCreators: "maopian:xCreators",
  xSession: "maopian:xSession",
  xSeenTweets: "maopian:xSeenTweets",
  xCrawlStatus: "maopian:xCrawlStatus"
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

export async function getReviewItems(): Promise<ReviewItem[]> {
  return readJson<ReviewItem[]>(KEYS.reviewItems, reviewItems);
}

export async function getXCreators(): Promise<XCreatorSource[]> {
  const items = await readJson<XCreatorSource[]>(KEYS.xCreators, xCreators);
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getXSession(): Promise<XSessionConfig> {
  return readJson<XSessionConfig>(KEYS.xSession, xSession);
}

export async function getXSeenTweets(): Promise<string[]> {
  return readJson<string[]>(KEYS.xSeenTweets, []);
}

export async function getXCrawlStatus(): Promise<XCrawlStatus> {
  return readJson<XCrawlStatus>(KEYS.xCrawlStatus, emptyCrawlStatus());
}

export async function saveReviewItems(nextItems: ReviewItem[]) {
  await writeJson(KEYS.reviewItems, nextItems);
  safeRevalidatePath("/admin/review");
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

export async function saveXCreators(nextCreators: XCreatorSource[]) {
  await writeJson(KEYS.xCreators, nextCreators);
  safeRevalidatePath("/admin/creators");
}

export async function saveXSession(nextSession: XSessionConfig) {
  await writeJson(KEYS.xSession, nextSession);
  safeRevalidatePath("/admin/creators");
}

export async function saveXSeenTweets(nextSeenTweets: string[]) {
  await writeJson(KEYS.xSeenTweets, Array.from(new Set(nextSeenTweets)));
}

export async function saveXCrawlStatus(nextStatus: XCrawlStatus) {
  await writeJson(KEYS.xCrawlStatus, {
    ...nextStatus,
    logs: nextStatus.logs.slice(-30),
    updatedAt: new Date().toISOString()
  });
  safeRevalidatePath("/admin/creators");
}

export function parseList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
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

export function creatorHandleFromUrl(value: string) {
  try {
    const url = new URL(value);
    const handle = url.pathname.split("/").filter(Boolean)[0] || "";
    return handle.replace(/^@/, "");
  } catch {
    return value.replace(/^@/, "").trim();
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
    // Worker scripts run outside the Next.js request cache context.
  }
}

function emptyCrawlStatus(): XCrawlStatus {
  return {
    running: false,
    phase: "idle",
    mode: "incremental",
    totalCreators: 0,
    completedCreators: 0,
    scanned: 0,
    added: 0,
    errors: 0,
    proxyConfigured: false,
    proxyMessage: "未配置代理。",
    message: "尚未开始采集。",
    logs: [],
    startedAt: "",
    updatedAt: "",
    finishedAt: ""
  };
}
