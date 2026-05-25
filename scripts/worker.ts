import cron from "node-cron";
import { getRedis } from "../lib/redis";
import { cronDailyCollect } from "../lib/env";
import { getXCreators } from "../lib/data";
import { reviewItems } from "../lib/seed";
import { crawlXCreators } from "../lib/x-crawler";

async function runDailyCollect() {
  const redis = await getRedis();
  const existing = await redis.get("review:items");
  const current = existing ? JSON.parse(existing) : [];
  const ids = new Set(current.map((item: { id: string }) => item.id));
  const nextItems = [...current];

  for (const item of reviewItems) {
    if (!ids.has(item.id)) {
      nextItems.push(item);
    }
  }

  await redis.set("review:items", JSON.stringify(nextItems));
  await redis.set("worker:lastCollectAt", new Date().toISOString());
  console.log(`[worker] collected ${nextItems.length} review items`);

  try {
    const creators = await getXCreators();
    const enabledCreators = creators.filter((creator) => creator.enabled);
    let added = 0;

    for (const creator of enabledCreators) {
      const full = !creator.lastCrawledAt;
      console.log(`[worker] x crawl @${creator.handle} mode=${full ? "full" : "incremental"}`);
      const results = await crawlXCreators({ creatorId: creator.id, full });
      added += results.reduce((sum, result) => sum + result.added, 0);
    }

    console.log(`[worker] x crawl added ${added} review items`);
  } catch (error) {
    console.error("[worker] x crawl skipped", error);
  }
}

async function main() {
  if (!cron.validate(cronDailyCollect)) {
    throw new Error(`Invalid CRON_DAILY_COLLECT: ${cronDailyCollect}`);
  }

  cron.schedule(cronDailyCollect, () => {
    runDailyCollect().catch((error) => {
      console.error("[worker] collect failed", error);
    });
  });

  console.log(`[worker] scheduled daily collect: ${cronDailyCollect}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
