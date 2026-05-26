export const siteUrl = normalizeUrl(process.env.SITE_URL || "http://localhost:3000");

export const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const adminUser = process.env.ADMIN_USER || "admin";

export const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || "";

export const adminPassword = process.env.ADMIN_PASSWORD || "";

export const baiduPushToken = process.env.BAIDU_PUSH_TOKEN || "";

export function absoluteUrl(path = "/") {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${safePath}`;
}

function normalizeUrl(value: string) {
  return value.replace(/\/+$/, "");
}
