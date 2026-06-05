import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { getCategories, getResources } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, resources] = await Promise.all([getCategories(), getResources()]);
  const now = new Date();

  return [
    "",
    "/about",
    "/privacy",
    "/copyright",
    "/contact",
    "/me",
    "/open-in-browser",
    ...categories.map((category) => `/categories/${category.slug}`),
    ...resources.flatMap((resource) => [`/tools/${resource.slug}`, `/view/${resource.slug}`])
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/tools") ? "weekly" : "daily",
    priority: path === "" ? 1 : path.startsWith("/tools") ? 0.7 : 0.8
  }));
}
