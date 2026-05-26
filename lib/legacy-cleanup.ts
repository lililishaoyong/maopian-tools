import { getRedis } from "./redis";

const MIGRATION_KEY = "maopian:migrations:remove-crawl-v1";

const LEGACY_CRAWL_KEYS = [
  "review:items",
  "maopian:xCreators",
  "maopian:xSession",
  "maopian:xSeenTweets",
  "maopian:xCrawlStatus",
  "maopian:xCrawlHistory",
  "maopian:xCrawlSafetyState",
  "worker:lastCollectAt"
];

export async function cleanupLegacyCrawlData() {
  try {
    const redis = await getRedis();
    const migrated = await redis.get(MIGRATION_KEY);
    if (migrated) return;

    await redis.del(LEGACY_CRAWL_KEYS);
    await redis.set(MIGRATION_KEY, new Date().toISOString());
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[legacy-cleanup]", error);
    }
  }
}
